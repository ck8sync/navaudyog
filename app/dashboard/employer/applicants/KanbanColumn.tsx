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
    <div className={`p-4 rounded-lg border-2 ${column.color}`}>
      <h3 className="font-semibold mb-4">{column.label}</h3>
      <SortableContext
        items={applications.map(a => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {applications.map(app => (
            <KanbanCard key={app.id} application={app} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}