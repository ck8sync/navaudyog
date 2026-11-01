'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Search, Briefcase, User, LayoutDashboard, PlusCircle, Users } from 'lucide-react'

export default function BottomNav() {
  const { user, profile } = useAuth()
  const pathname = usePathname()

  if (!user || !profile) return null

  const role = profile.role

  const employeeLinks = [
    { label: 'Browse', href: '/jobs', icon: Search },
    { label: 'Applied', href: '/dashboard/employee', icon: Briefcase },
    { label: 'Profile', href: '/profile/employee', icon: User },
  ]

  const employerLinks = [
    { label: 'Home', href: '/dashboard/employer', icon: LayoutDashboard },
    { label: 'Post Job', href: '/dashboard/employer/jobs/new', icon: PlusCircle },
    { label: 'Applicants', href: '/dashboard/employer/applicants', icon: Users },
    { label: 'My Jobs', href: '/dashboard/employer/jobs', icon: Briefcase },
  ]

  const links = role === 'employer' ? employerLinks : (role === 'admin' ? [] : employeeLinks)

  if (links.length === 0) return null

  return (
    <div className="site-bottom-nav md:hidden fixed bottom-0 left-0 right-0 border-t px-6 py-3 flex justify-between items-center z-50">
      {links.map((link) => {
        const Icon = link.icon
        const isActive = pathname === link.href
        return (
          <Link 
            key={link.href} 
            href={link.href}
            className={`bottom-nav-link flex flex-col items-center space-y-1 transition-colors ${isActive ? 'active' : ''}`}
          >
            <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{link.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
