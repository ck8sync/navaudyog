import { BRAND } from '@/lib/constants'

interface StatusBadgeProps {
  status: string
  className?: string
}

const STATUS_COLORS: Record<string, string> = {
  applied: "bg-blue-50 text-blue-700 border-blue-200",
  reviewing: "bg-amber-50 text-amber-700 border-amber-200",
  interview: "bg-purple-50 text-purple-700 border-purple-200",
  hired: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  active: "bg-green-50 text-green-700 border-green-200",
  draft: "bg-gray-50 text-gray-700 border-gray-200",
  closed: "bg-red-50 text-red-700 border-red-200",
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[status.toLowerCase()] || "bg-gray-50 text-gray-700 border-gray-200"
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${colorClass} ${className}`}>
      {status}
    </span>
  )
}