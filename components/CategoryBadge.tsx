interface CategoryBadgeProps {
  category: string
  className?: string
}

const CATEGORY_COLORS: Record<string, string> = {
  "Construction & Labour": "bg-orange-50 text-orange-700 border-orange-200",
  "Manufacturing & Factory": "bg-blue-50 text-blue-700 border-blue-200",
  "Delivery & Logistics": "bg-purple-50 text-purple-700 border-purple-200",
  "Security & Housekeeping": "bg-slate-50 text-slate-700 border-slate-200",
  "Retail & Sales": "bg-pink-50 text-pink-700 border-pink-200",
  "Driver & Transport": "bg-cyan-50 text-cyan-700 border-cyan-200",
}

export default function CategoryBadge({ category, className = "" }: CategoryBadgeProps) {
  const colorClass = CATEGORY_COLORS[category] || "bg-gray-50 text-gray-700 border-gray-200"

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${colorClass} ${className}`}>
      {category}
    </span>
  )
}