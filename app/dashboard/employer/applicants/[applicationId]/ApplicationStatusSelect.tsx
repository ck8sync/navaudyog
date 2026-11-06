'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { KANBAN_COLUMNS } from '@/lib/constants'

export default function ApplicationStatusSelect({ applicationId, initialStatus }: { applicationId: string; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const updateStatus = async (nextStatus: string) => {
    const previousStatus = status
    setStatus(nextStatus)
    setSaving(true)
    setError('')

    const { data, error: updateError } = await supabase
      .from('applications')
      .update({ status: nextStatus })
      .eq('id', applicationId)
      .select('id')
      .maybeSingle()

    if (updateError || !data) {
      setStatus(previousStatus)
      setError(updateError?.message || 'Could not update the application status. Please try again.')
    }
    setSaving(false)
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <label htmlFor="application-status" className="sr-only">Application status</label>
      <select
        id="application-status"
        value={status}
        disabled={saving}
        onChange={event => void updateStatus(event.target.value)}
        className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white outline-none transition hover:bg-white/20 disabled:opacity-60"
      >
        {KANBAN_COLUMNS.map(column => <option key={column.id} value={column.id} className="bg-white text-gray-900">{column.label}</option>)}
      </select>
      {saving && <span className="text-xs text-white/70">Saving…</span>}
      {error && <span role="alert" className="max-w-48 text-right text-xs text-red-200">{error}</span>}
    </div>
  )
}
