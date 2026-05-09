'use client'

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import KanbanCard from './KanbanCard'

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
  created_at: string
}

interface ColumnProps {
  column: any
  applications: Application[]
}

export default function KanbanColumn({ column, applications }: ColumnProps) {
  return (
    <div className={`p-4 rounded-3xl border-2 ${column.color} bg-white/50 min-h-[500px]`}>
      <div className="flex items-center justify-between mb-6 px-2">
         <h3 className="text-sm font-black uppercase tracking-widest text-gray-700">{column.label}</h3>
         <span className="text-[10px] font-black bg-white/80 px-2 py-0.5 rounded-full border border-gray-100 shadow-sm">
            {applications.length}
         </span>
      </div>
      
      <SortableContext
        items={applications.map(a => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {applications.map(app => (
            <KanbanCard key={app.id} application={app} />
          ))}
          {applications.length === 0 && (
            <div className="h-32 rounded-2xl border-2 border-dashed border-gray-200/50 flex items-center justify-center text-[10px] font-black text-gray-300 uppercase tracking-widest">
               Empty
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}