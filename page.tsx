'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import {
  DndContext,
  pointerWithin,
  rectIntersection,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  CollisionDetection,
} from '@dnd-kit/core'
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { KANBAN_COLUMNS, BRAND, APPLICATION_STATUS_META, isApplicationStatus, type ApplicationStatus } from '@/lib/constants'
import KanbanColumn from './KanbanColumn'
import KanbanCardPreview from './KanbanCardPreview'
import type { KanbanApplication as Application } from './types'

export default function KanbanBoard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const { user, loading: authLoading } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const sensors = useSensors(
    // Require a small movement before dragging starts so the Call / WhatsApp /
    // View Full Profile links and the status menu inside a card stay clickable.
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    // On touch screens, press-and-hold to drag so normal scrolling still works.
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const loadApplications = useCallback(async (userId: string) => {
    setLoadError('')

    const { data: employerJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id')
      .eq('employer_id', userId)

    if (jobsError) {
      setLoadError(`Could not load your jobs: ${jobsError.message}`)
      return
    }

    const jobIds = employerJobs?.map((j) => j.id) || []
    if (jobIds.length === 0) {
      setApplications([])
      return
    }

    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        profiles:employee_id(
          full_name,
          phone,
          employee_profiles(city, years_experience)
        ),
        jobs:job_id(title)
      `)
      .in('job_id', jobIds)
      .order('created_at', { ascending: false })

    if (error) {
      setLoadError(`Could not load applicants: ${error.message}`)
      return
    }

    setApplications((data || []) as unknown as Application[])
  }, [supabase])

  useEffect(() => {
    if (authLoading) return
    let cancelled = false

    async function run() {
      if (!user) {
        if (!cancelled) {
          setLoadError('Please sign in with your employer account to view applicants.')
          setLoading(false)
        }
        return
      }
      await loadApplications(user.id)
      if (!cancelled) setLoading(false)
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [user, authLoading, loadApplications])

  /**
   * Persist a status change in Supabase and only then move the card.
   * The UI never shows a status that has not been saved.
   */
  const updateStatus = useCallback(async (applicationId: string, newStatus: ApplicationStatus) => {
    const app = applications.find(a => a.id === applicationId)
    if (!app || app.status === newStatus || pendingIds.has(applicationId)) return

    setPendingIds(prev => new Set(prev).add(applicationId))

    // The server route saves the status (RLS-checked) and e-mails the candidate.
    let result: { status?: string; error?: string; email?: { sent: boolean; reason?: string } } = {}
    let ok = false
    try {
      const res = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      result = await res.json().catch(() => ({}))
      ok = res.ok && typeof result.status === 'string'
    } catch {
      result = { error: 'Network error. Check your connection and try again.' }
    }

    setPendingIds(prev => {
      const next = new Set(prev)
      next.delete(applicationId)
      return next
    })

    if (!ok) {
      toast.error('Status not updated', {
        description: result.error || 'You do not have permission to update this application.',
      })
      return
    }

    const savedStatus = result.status as string
    setApplications(prev => prev.map(a =>
      a.id === applicationId ? { ...a, status: savedStatus } : a
    ))
    const name = app.profiles?.full_name || 'Applicant'
    const label = isApplicationStatus(savedStatus) ? APPLICATION_STATUS_META[savedStatus].label : savedStatus
    if (result.email?.sent) {
      toast.success(`${name} moved to ${label}`, { description: 'The candidate has been notified by email.' })
    } else {
      toast.success(`${name} moved to ${label}`, {
        description: `Email not sent: ${result.email?.reason || 'unknown reason'}`,
      })
    }
  }, [applications, pendingIds])

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const draggedApp = applications.find(a => a.id === active.id)
    if (!draggedApp) return

    // Dropping onto another card uses that card's column; dropping onto a
    // column (including an empty one) uses the column's status id.
    const targetApp = applications.find(a => a.id === over.id)
    const newStatus = targetApp?.status ?? String(over.id)
    if (!isApplicationStatus(newStatus) || newStatus === draggedApp.status) return

    void updateStatus(draggedApp.id, newStatus)
  }

  // Prefer the droppable under the pointer (the column you actually drop on),
  // falling back to rectangle intersection (keyboard / touch). Ignore the
  // dragged card itself so it never "drops onto itself".
  const collisionDetection: CollisionDetection = (args) => {
    const filtered = {
      ...args,
      droppableContainers: args.droppableContainers.filter(c => c.id !== args.active.id),
    }
    const pointerHits = pointerWithin(filtered)
    if (pointerHits.length > 0) return pointerHits
    return rectIntersection(filtered)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-9 w-64 bg-gray-100 rounded-xl animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {KANBAN_COLUMNS.map(c => (
            <div key={c.id} className="h-[500px] rounded-3xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const activeApp = activeId ? applications.find(a => a.id === activeId) : undefined

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold" style={{ color: BRAND.primary }}>
          Applicants Kanban
        </h1>
        {user && (
          <button
            type="button"
            onClick={() => { setLoading(true); loadApplications(user.id).finally(() => setLoading(false)) }}
            className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-brand-navy border border-gray-200 rounded-xl px-4 py-2 bg-white"
          >
            Refresh
          </button>
        )}
      </div>

      {loadError && (
        <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {loadError}
        </div>
      )}

      {!loadError && applications.length === 0 && (
        <p className="mb-6 text-sm font-bold text-gray-500">
          No applications yet. New applicants will appear in the Applied column.
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {KANBAN_COLUMNS.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              applications={applications.filter(a => a.status === column.id)}
              pendingIds={pendingIds}
              onStatusChange={updateStatus}
            />
          ))}
        </div>
        <DragOverlay>
          {activeApp ? <KanbanCardPreview application={activeApp} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
