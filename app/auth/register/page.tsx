'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import '@/app/auth/auth.css'

export default function RegisterPage() {
  const [role, setRole] = useState<'employee' | 'employer'>('employee')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Enter a valid 10-digit Indian mobile number.')
      return
    }
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role, full_name: fullName, phone } },
      })
      if (signUpError) {
        setError(signUpError.message)
        return
      }
      if (data.session) {
        router.push(`/profile/${role}`)
        return
      }
      if (data.user) {
        setNotice('Check your email for a confirmation link. Once confirmed, sign in to finish setting up your profile.')
      } else {
        setError('We could not create your account. Please try again.')
      }
    } catch {
      setError('We could not connect to Nava Udyog. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return <div className="auth-page auth-page-register">
    <div className="auth-orbit" aria-hidden="true" />
    <div className="auth-shell auth-shell-register">
      <div className="auth-heading">
        <Link href="/" className="auth-brand" aria-label="Nava Udyog home"><Logo /></Link>
        <p className="auth-kicker">Start with what you do</p>
        <h1>Create your account.</h1>
        <p className="auth-description">Join India&apos;s workforce network as a job seeker or employer.</p>
      </div>

      <div className="auth-card">
        <div className="auth-role" role="group" aria-label="Choose account type">
          <button type="button" aria-pressed={role === 'employee'} className={role === 'employee' ? 'selected' : ''} onClick={() => setRole('employee')}>Job seeker</button>
          <button type="button" aria-pressed={role === 'employer'} className={role === 'employer' ? 'selected' : ''} onClick={() => setRole('employer')}>Employer</button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field"><label htmlFor="fullName">Full name <span>*</span></label><input id="fullName" type="text" autoComplete="name" required placeholder="Enter your name" value={fullName} onChange={(event) => setFullName(event.target.value)} /></div>
          <div className="auth-field"><label htmlFor="email">Email address <span>*</span></label><input id="email" type="email" autoComplete="email" required placeholder="name@example.com" value={email} onChange={(event) => setEmail(event.target.value)} /></div>
          <div className="auth-field"><label htmlFor="phone">Phone number <span>*</span></label><input id="phone" type="tel" autoComplete="tel-national" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} required placeholder="10-digit Indian mobile number" value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))} /><small>Use a valid Indian mobile number.</small></div>
          <div className="auth-field"><label htmlFor="password">Password <span>*</span></label><input id="password" type="password" autoComplete="new-password" minLength={8} required placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} /></div>
          {error && <div className="auth-alert" role="alert">{error}</div>}
          {notice && <div className="auth-notice" role="status">{notice}</div>}
          <button type="submit" disabled={loading} className="auth-submit auth-submit-coral">{loading ? 'Creating account…' : 'Create account'} <span aria-hidden="true">→</span></button>
          <p className="auth-switch">Already have an account? <Link href="/auth/login">Sign in</Link></p>
        </form>
      </div>
      <p className="auth-footnote">Your skills are your profile. No resume needed.</p>
    </div>
  </div>
}
