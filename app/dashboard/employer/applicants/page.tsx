'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { KANBAN_COLUMNS, BRAND } from '@/lib/constants'
import KanbanColumn from './KanbanColumn'

interface Application {
  id: string
  job_id: string
  employee_id: string
  status: string
  note: string
  created_at: string
  profiles?: {
    full_name: string
    phone: string
    employee_profiles?: {
      city: string
      years_experience: string
    }
  }
  jobs?: {
    title: string
  }
}

export default function KanbanBoard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    if (!user) return
    const { data } = await supabase
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
      .in('job_id', 
        (await supabase
          .from('jobs')
          .select('id')
          .eq('employer_id', user.id)).data?.map((j: any) => j.id) || []
      )
    setApplications(data || [])
    setLoading(false)
  }

  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    if (!over) return

    const draggedApp = applications.find(a => a.id === active.id)
    if (!draggedApp) return

    const newStatus = over.id
    await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', draggedApp.id)

    setApplications(applications.map(app =>
      app.id === draggedApp.id ? { ...app, status: newStatus } : app
    ))
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8" style={{ color: BRAND.primary }}>
        Applicants Kanban
      </h1>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {KANBAN_COLUMNS.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              applications={applications.filter(a => a.status === column.id)}
            />
          ))}
        </div>
      </DndContext>
    </div>
  )
}