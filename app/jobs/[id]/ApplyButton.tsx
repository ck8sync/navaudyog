'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { BRAND } from '@/lib/constants'

export default function ApplyButton({ jobId }: { jobId: string }) {
  const [showModal, setShowModal] = useState(false)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const handleApply = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('applications')
      .insert({
        job_id: jobId,
        employee_id: user.id,
        note,
      })

    if (error) {
      alert('Error applying: ' + error.message)
    } else {
      alert('Application submitted!')
      setShowModal(false)
    }
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="mt-6 w-full py-3 px-4 text-white rounded-md hover:opacity-90"
        style={{ backgroundColor: BRAND.primary }}
      >
        Apply Now
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Submit Application</h2>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              rows={4}
              placeholder="Add a note (optional, max 200 chars)"
              maxLength={200}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleApply}
                disabled={loading}
                className="flex-1 py-2 px-4 text-white rounded-md hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: BRAND.primary }}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}