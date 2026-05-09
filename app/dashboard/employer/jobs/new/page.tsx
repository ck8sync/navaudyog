'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { JOB_CATEGORIES, PAY_TYPES, BRAND } from '@/lib/constants'

export default function PostJobPage() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [openings, setOpenings] = useState('1')
  const [payAmount, setPayAmount] = useState('')
  const [payType, setPayType] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('active')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase
      .from('jobs')
      .insert({
        employer_id: user.id,
        title,
        category,
        location,
        openings: parseInt(openings),
        pay_amount: parseInt(payAmount),
        pay_type: payType,
        description,
        status,
      })

    if (error) {
      setError(error.message)
    } else {
      alert('Job posted successfully!')
      router.push('/dashboard/employer/jobs')
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8" style={{ color: BRAND.primary }}>
          Post a New Job
        </h1>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g. Delivery Boy, Mason Helper"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select category</option>
              {JOB_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Job location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Openings
              </label>
              <input
                type="number"
                min="1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={openings}
                onChange={(e) => setOpenings(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pay Amount
              </label>
              <input
                type="number"
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Amount"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pay Type
            </label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={payType}
              onChange={(e) => setPayType(e.target.value)}
            >
              <option value="">Select pay type</option>
              {PAY_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description
            </label>
            <textarea
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={6}
              placeholder="Describe the job, responsibilities, and requirements"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  className="mr-2"
                  checked={status === 'draft'}
                  onChange={(e) => setStatus(e.target.value)}
                />
                Save as Draft
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  className="mr-2"
                  checked={status === 'active'}
                  onChange={(e) => setStatus(e.target.value)}
                />
                Publish Now
              </label>
            </div>
          </div>

          {error && <p className="text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-white rounded-md hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: BRAND.primary }}
          >
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </form>
      </div>
    </div>
  )
}