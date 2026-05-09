'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { BRAND } from '@/lib/constants'

export default function RegisterPage() {
  const [role, setRole] = useState<'employee' | 'employer'>('employee')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    // Sign up with metadata for the database trigger
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          full_name: fullName,
          phone,
        }
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Redirect to profile setup
      // Note: The profiles record is now created automatically via database trigger
      router.push(`/profile/${role}`)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-[600px] h-[600px] bg-brand-light opacity-20 blur-[120px] rounded-full z-0" />
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-black tracking-tighter" style={{ color: BRAND.primary }}>
              {BRAND.name.toUpperCase()}
            </h1>
          </Link>
          <h2 className="mt-4 text-xl font-black text-gray-900 uppercase tracking-tight">
            Create Your Account
          </h2>
          <p className="mt-2 text-gray-400 font-bold uppercase tracking-widest text-xs">Join India's real workforce</p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
          {/* Role Tabs */}
          <div className="flex p-1 bg-gray-50 rounded-2xl mb-8">
            <button
              type="button"
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                role === 'employee'
                  ? 'bg-white text-brand-navy shadow-sm border border-gray-100'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              onClick={() => setRole('employee')}
            >
              Job Seeker
            </button>
            <button
              type="button"
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                role === 'employer'
                  ? 'bg-white text-brand-navy shadow-sm border border-gray-100'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              onClick={() => setRole('employer')}
            >
              Employer
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none transition-all"
                  placeholder="Enter your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none transition-all"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none transition-all"
                  placeholder="+91 00000 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none transition-all"
                  placeholder="Create a password"
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
              className="btn-accent w-full py-4 text-lg"
            >
              {loading ? 'Creating account...' : 'Join Navaudyog'}
            </button>

            <div className="text-center pt-4">
              <Link
                href="/auth/login"
                className="text-sm font-bold text-gray-400 hover:text-brand-navy transition-colors"
              >
                Already have an account? <span className="text-brand-navy">Sign in</span>
              </Link>
            </div>
          </form>
        </div>
        
        <p className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
           🇮🇳 New Job, New Start.
        </p>
      </div>
    </div>
  )
}