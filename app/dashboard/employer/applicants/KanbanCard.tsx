'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Application {
  id: string
  profiles?: {
    full_name: string
    phone: string
  }
  employee_profiles?: {
    city: string
    years_experience: string
  }
  jobs?: {
    title: string
  }
  note: string
}

export default function KanbanCard({ application }: { application: Application }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: application.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const whatsappMessage = `Hi ${application.profiles?.full_name}, I saw your application on Navaudyog`
  const whatsappUrl = `https://wa.me/91${application.profiles?.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 rounded-lg shadow-md cursor-grab active:cursor-grabbing border border-gray-200"
    >
      <h4 className="font-semibold text-gray-900 mb-2">{application.profiles?.full_name}</h4>
      <p className="text-sm text-gray-600">{application.employee_profiles?.city}</p>
      <p className="text-sm text-gray-600">{application.employee_profiles?.years_experience}</p>
      <p className="text-sm text-gray-600 mb-2">{application.jobs?.title}</p>
      {application.note && <p className="text-xs text-gray-500 italic mb-2">"{application.note}"</p>}
      <div className="flex gap-2 mt-2">
        <a
          href={`tel:+91${application.profiles?.phone?.replace(/\D/g, '')}`}
          className="flex-1 text-xs py-1 px-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-center"
        >
          Call
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-xs py-1 px-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-center"
        >
          WhatsApp
        </a>
      </div>
    </div>
  )
}