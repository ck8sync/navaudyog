import { JOB_CATEGORIES } from '@/lib/constants'

interface CategoryBadgeProps {
  category: string
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  const categoryColors: Record<string, string> = {
    'Construction & Labour': 'bg-orange-100 text-orange-800',
    'Manufacturing & Factory': 'bg-blue-100 text-blue-800',
    'Delivery & Logistics': 'bg-green-100 text-green-800',
    'Security & Housekeeping': 'bg-red-100 text-red-800',
    'Retail & Sales': 'bg-purple-100 text-purple-800',
    'Driver & Transport': 'bg-yellow-100 text-yellow-800',
  }

  const color = categoryColors[category] || 'bg-gray-100 text-gray-800'

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
      {category}
    </span>
  )
}