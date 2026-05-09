'use client'

import { BRAND } from '@/lib/constants'
import { MapPin, Briefcase, IndianRupee, Users, Calendar, Bookmark } from 'lucide-react'
import Link from 'next/link'
import CategoryBadge from './CategoryBadge'

interface JobCardProps {
  job: {
    id: string
    title: string
    category: string
    location: string
    pay_amount: number
    pay_type: string
    openings: number
    created_at: string
    employer_profiles?: {
      company_name: string
    }
  }
  isSaved?: boolean
  onSaveToggle?: () => void
}

export default function JobCard({ job, isSaved, onSaveToggle }: JobCardProps) {
  return (
    <div className="card-premium flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <CategoryBadge category={job.category} />
        <button 
          onClick={(e) => {
            e.preventDefault()
            onSaveToggle?.()
          }}
          className={`p-2 rounded-full transition-colors ${
            isSaved ? 'bg-amber-100 text-amber-600' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      <Link href={`/jobs/${job.id}`} className="group flex-grow">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-navy transition-colors mb-1">
          {job.title}
        </h3>
        <p className="text-brand-amber font-bold text-sm mb-4">
          {job.employer_profiles?.company_name}
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            {job.location}
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <IndianRupee className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-bold text-gray-900">₹{job.pay_amount}</span>
            <span className="ml-1">/ {job.pay_type}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <Users className="w-4 h-4 mr-2 text-gray-400" />
            {job.openings} Openings
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex items-center text-gray-400 text-xs">
          <Calendar className="w-3.5 h-3.5 mr-1" />
          {new Date(job.created_at).toLocaleDateString()}
        </div>
        <Link 
          href={`/jobs/${job.id}`}
          className="text-sm font-bold text-brand-navy hover:underline"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}
