import { BRAND } from '@/lib/constants'

interface StatusBadgeProps {
  status: string
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusColors: Record<string, { bg: string; text: string }> = {
    applied: { bg: 'bg-blue-100', text: 'text-blue-800' },
    reviewing: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    interview: { bg: 'bg-purple-100', text: 'text-purple-800' },
    hired: { bg: 'bg-green-100', text: 'text-green-800' },
    rejected: { bg: 'bg-red-100', text: 'text-red-800' },
    draft: { bg: 'bg-gray-100', text: 'text-gray-800' },
    active: { bg: 'bg-green-100', text: 'text-green-800' },
    closed: { bg: 'bg-red-100', text: 'text-red-800' },
  }

  const colors = statusColors[status] || { bg: 'bg-gray-100', text: 'text-gray-800' }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.bg} ${colors.text}`}>
      {status}
    </span>
  )
}