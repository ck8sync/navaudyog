'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { JOB_CATEGORIES, PAY_TYPES, BRAND } from '@/lib/constants'
import { Briefcase, ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'

export default function NewJobPage() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [openings, setOpenings] = useState(1)
  const [payAmount, setPayAmount] = useState('')
  const [payType, setPayType] = useState('Monthly Salary')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'active' | 'draft'>('active')
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
    const { error: insertError } = await supabase
      .from('jobs')
      .insert({
        employer_id: user.id,
        title,
        category,
        location,
        openings: Number(openings),
        pay_amount: Number(payAmount),
        pay_type: payType,
        description,
        status,
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      router.push('/dashboard/employer/jobs')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard/employer/jobs" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-brand-navy mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Jobs
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="flex items-center gap-4 mb-10">
             <div className="w-14 h-14 rounded-2xl bg-brand-light flex items-center justify-center text-brand-navy">
                <Briefcase className="w-7 h-7" />
             </div>
             <div>
                <h1 className="text-3xl font-black text-gray-900">Post a New Job</h1>
                <p className="text-gray-500">Reach thousands of workers in minutes.</p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-gray-400">Job Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Delivery Driver, Security Guard"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-gray-400">Industry Category</label>
                <select 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select Category</option>
                  {JOB_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-gray-400">Job Location</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Pune, Maharashtra"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-gray-400">Number of Openings</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none"
                  value={openings}
                  onChange={(e) => setOpenings(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-gray-400">Pay Amount (₹)</label>
                <input 
                  type="number" 
                  required
                  placeholder="e.g. 15000"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-gray-400">Pay Frequency</label>
                <select 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none"
                  value={payType}
                  onChange={(e) => setPayType(e.target.value)}
                >
                  {PAY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-widest text-gray-400">Job Description & Requirements</label>
              <textarea 
                required
                rows={6}
                placeholder="Explain the work, timings, and what the candidate needs (e.g. must have a bike, 10th pass, etc.)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-6 pt-6">
               <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary flex-grow py-4 text-lg flex items-center justify-center gap-2"
                  onClick={() => setStatus('active')}
               >
                  <Send className="w-5 h-5" />
                  {loading ? 'Publishing...' : 'Publish Job Listing'}
               </button>
               <button 
                  type="button"
                  disabled={loading}
                  className="px-8 py-4 rounded-xl border-2 border-gray-100 font-black text-gray-400 hover:border-brand-navy hover:text-brand-navy transition-all"
                  onClick={(e) => {
                     setStatus('draft');
                     handleSubmit(e as any);
                  }}
               >
                  Save as Draft
               </button>
            </div>

            {error && <p className="text-red-600 font-bold text-center mt-4">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  )
}