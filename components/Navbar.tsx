'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { BRAND } from '@/lib/constants'
import { LogOut, User, Briefcase, LayoutDashboard } from 'lucide-react'

export default function Navbar() {
  const { user, profile, signOut, dashboardPath } = useAuth()

  return (
    <nav className="sticky top-0 z-50 glass border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-black tracking-tighter" style={{ color: BRAND.primary }}>
                {BRAND.name.toUpperCase()}
              </span>
              <span className="hidden sm:block text-xs italic font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                {BRAND.tagline}
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/jobs" className="text-sm font-semibold text-gray-600 hover:text-brand-navy transition-colors">
              Browse Jobs
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-6">
                <Link href={dashboardPath || '/'} className="flex items-center space-x-1 text-sm font-semibold text-gray-600 hover:text-brand-navy">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <button 
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login" className="text-sm font-semibold text-gray-600 hover:text-brand-navy">
                  Login
                </Link>
                <Link href="/auth/register" className="btn-primary py-2 px-5 text-sm">
                  Join Now
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center md:hidden">
             <span className="text-xs font-bold text-gray-400">🇮🇳 Made in India</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
