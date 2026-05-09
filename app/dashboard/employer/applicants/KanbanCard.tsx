'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Phone, MessageSquare, MapPin, Briefcase, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Application {
  id: string
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
  note: string
  created_at: string
}

export default function KanbanCard({ application }: { application: Application }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: application.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const phone = application.profiles?.phone?.replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(`Hi ${application.profiles?.full_name}, I saw your application on Navaudyog for the ${application.jobs?.title} role.`)}`

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
         <div>
            <h4 className="font-black text-gray-900 group-hover:text-brand-navy transition-colors">{application.profiles?.full_name}</h4>
            <div className="flex items-center text-[10px] font-black text-brand-amber uppercase tracking-widest">
               {application.jobs?.title}
            </div>
         </div>
      </div>

      <div className="space-y-2 mb-6">
         <div className="flex items-center text-xs text-gray-500 font-bold">
            <MapPin className="w-3 h-3 mr-2 opacity-50" /> {application.profiles?.employee_profiles?.city}
         </div>
         <div className="flex items-center text-xs text-gray-500 font-bold">
            <Briefcase className="w-3 h-3 mr-2 opacity-50" /> {application.profiles?.employee_profiles?.years_experience} exp
         </div>
      </div>

      {application.note && (
        <div className="bg-gray-50 p-3 rounded-xl mb-6 italic text-[11px] text-gray-500 border border-gray-100">
           "{application.note}"
        </div>
      )}

      <div className="flex gap-2">
        <a
          href={`tel:+91${phone}`}
          className="flex-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest py-2 bg-brand-light text-brand-navy rounded-lg hover:bg-brand-navy hover:text-white transition-all"
        >
          <Phone className="w-3 h-3" /> Call
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"
        >
          <MessageSquare className="w-3 h-3" /> WhatsApp
        </a>
      </div>

      <Link 
         href={`/dashboard/employer/applicants/${application.id}`}
         className="mt-4 flex items-center justify-center text-[10px] font-black text-gray-400 hover:text-brand-navy transition-colors uppercase tracking-widest"
      >
         View Full Profile <ChevronRight className="w-3 h-3 ml-1" />
      </Link>
    </div>
  )
}