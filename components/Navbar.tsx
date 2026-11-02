'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { LogOut, LayoutDashboard, Menu, X } from 'lucide-react'
import Logo from './Logo'

export default function Navbar() {
  const { user, signOut, dashboardPath } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  async function handleSignOut() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await signOut()
    } catch {
      setLoggingOut(false)
    }
  }

  return (
    <nav className="site-nav sticky top-0 z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Logo />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/jobs" className="nav-link text-sm font-semibold transition-colors">
              Browse jobs
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-6">
                <Link href={dashboardPath || '/'} className="nav-link flex items-center space-x-1 text-sm font-semibold">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <button 
                  onClick={handleSignOut}
                  disabled={loggingOut}
                  className="nav-link nav-logout flex items-center space-x-1 text-sm font-semibold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{loggingOut ? 'Signing out…' : 'Logout'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login" className="nav-link text-sm font-semibold">
                  Log in
                </Link>
                <Link href="/auth/register" className="site-join py-2 px-5 text-sm">
                  Join now <span aria-hidden="true">â†’</span>
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 md:hidden">
            {user ? (
              <>
                <Link href={dashboardPath || '/'} className="nav-mobile-action" onClick={() => setMobileMenuOpen(false)}>
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <button type="button" onClick={handleSignOut} disabled={loggingOut} className="nav-mobile-action nav-mobile-logout">
                  <LogOut className="h-4 w-4" /> {loggingOut ? 'Signing out…' : 'Logout'}
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="nav-mobile-action">Log in</Link>
                <Link href="/auth/register" className="nav-mobile-join">Join now</Link>
              </>
            )}
            <button
              type="button"
              className="nav-mobile-menu-button"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="nav-mobile-menu md:hidden">
            <Link href="/jobs" onClick={() => setMobileMenuOpen(false)}>Browse jobs</Link>
            {user ? (
              <Link href={dashboardPath || '/'} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
            ) : (
              <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>Create an account</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
