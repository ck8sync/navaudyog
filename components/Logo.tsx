import Image from 'next/image'
import { BRAND } from '@/lib/constants'

export default function Logo({ className = "h-8 w-auto", showText = true }: { className?: string, showText?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-10 w-10 shrink-0">
        <Image
          src="/logo.png"
          alt="Nava Udyog Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className="text-xl font-black tracking-tighter" style={{ color: BRAND.primary }}>
          {BRAND.name.toUpperCase()}
        </span>
      )}
    </div>
  )
}
