'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { BRAND } from '@/lib/constants'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { user, profile, dashboardPath } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Auto-redirect once the profile and dashboard path are loaded
  useEffect(() => {
    if (user && profile && dashboardPath && isRedirecting) {
      router.push(dashboardPath)
    }
  }, [user, profile, dashboardPath, isRedirecting, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // We are logged in! Now we wait for the AuthContext to fetch the profile.
      // The useEffect above will trigger once the profile is ready.
      setIsRedirecting(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-light opacity-20 blur-[120px] rounded-full z-0" />
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-black tracking-tighter" style={{ color: BRAND.primary }}>
              {BRAND.name.toUpperCase()}
            </h1>
          </Link>
          <h2 className="mt-6 text-2xl font-black text-gray-900 italic">
             "New Job, New Start."
          </h2>
          <p className="mt-2 text-gray-500 font-bold uppercase tracking-widest text-xs">Sign in to your account</p>
        </div>
        
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none text-lg transition-all"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none text-lg transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-lg"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="text-center pt-4">
              <Link
                href="/auth/register"
                className="text-sm font-bold text-gray-400 hover:text-brand-navy transition-colors"
              >
                Don't have an account? <span className="text-brand-amber">Create one</span>
              </Link>
            </div>
          </form>
        </div>
        
        <p className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
           🇮🇳 Made in India
        </p>
      </div>
    </div>
  )
}