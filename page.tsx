'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { BRAND } from '@/lib/constants'
import { Eye, EyeOff, Check, X } from 'lucide-react'

export default function RegisterPage() {
  const [role, setRole] = useState<'employee' | 'employer'>('employee')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const router = useRouter()

  // --- Validation helpers ---
  const isValidPhone = (val: string) => /^[6-9]\d{9}$/.test(val.replace(/\s/g, ''))
  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
  const isValidName = (val: string) => val.trim().length >= 2 && /^[a-zA-Z\s.]+$/.test(val.trim())

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
  }
  const isPasswordValid = Object.values(passwordChecks).every(Boolean)

  const formatPhone = (val: string) => {
    // Only keep digits, max 10
    const digits = val.replace(/\D/g, '').slice(0, 10)
    return digits
  }

  const handlePhoneChange = (val: string) => {
    setPhone(formatPhone(val))
  }

  const canSubmit = isValidName(fullName) && isValidEmail(email) && isValidPhone(phone) && isPasswordValid

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ fullName: true, email: true, phone: true, password: true })

    if (!canSubmit) {
      setError('Please fix the errors above before submitting.')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          full_name: fullName.trim(),
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
      router.push(`/profile/${role}`)
    }
    setLoading(false)
  }

  const fieldError = (field: string, isValid: boolean, message: string) => {
    if (!touched[field]) return null
    if (isValid) return null
    return <p className="text-red-500 text-xs font-semibold mt-1">{message}</p>
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
          <p className="mt-2 text-gray-400 font-bold uppercase tracking-widest text-xs">Join India&apos;s real workforce</p>
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

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  autoComplete="name"
                  className={`w-full px-4 py-3.5 rounded-xl border outline-none transition-all ${
                    touched.fullName && !isValidName(fullName)
                      ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400'
                      : 'border-gray-200 focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy'
                  }`}
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, fullName: true }))}
                />
                {fieldError('fullName', isValidName(fullName), 'Please enter a valid name (letters only, at least 2 characters)')}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  className={`w-full px-4 py-3.5 rounded-xl border outline-none transition-all ${
                    touched.email && !isValidEmail(email)
                      ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400'
                      : 'border-gray-200 focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy'
                  }`}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, email: true }))}
                />
                {fieldError('email', isValidEmail(email), 'Please enter a valid email address')}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm pointer-events-none">+91</span>
                  <input
                    id="phone"
                    type="tel"
                    required
                    autoComplete="tel-national"
                    inputMode="numeric"
                    maxLength={10}
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl border outline-none transition-all ${
                      touched.phone && !isValidPhone(phone)
                        ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400'
                        : 'border-gray-200 focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy'
                    }`}
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, phone: true }))}
                  />
                </div>
                {fieldError('phone', isValidPhone(phone), 'Enter a valid 10-digit Indian mobile number (starts with 6-9)')}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    className={`w-full px-4 py-3.5 pr-12 rounded-xl border outline-none transition-all ${
                      touched.password && !isPasswordValid
                        ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400'
                        : 'border-gray-200 focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy'
                    }`}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, password: true }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password strength indicators */}
                {(touched.password || password.length > 0) && (
                  <div className="mt-3 space-y-1.5">
                    {[
                      { key: 'length', label: 'At least 8 characters' },
                      { key: 'uppercase', label: 'One uppercase letter (A-Z)' },
                      { key: 'lowercase', label: 'One lowercase letter (a-z)' },
                      { key: 'number', label: 'One number (0-9)' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-2">
                        {passwordChecks[key as keyof typeof passwordChecks] ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-red-400" />
                        )}
                        <span className={`text-xs font-medium ${passwordChecks[key as keyof typeof passwordChecks] ? 'text-green-600' : 'text-gray-400'}`}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
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
              className="btn-accent w-full py-4 text-lg disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Join Nava Udyog'}
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
