'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import Logo from '@/components/Logo'
import '@/app/auth/auth.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [mode, setMode] = useState<'login' | 'reset'>('login')
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()
  const { user, profile, dashboardPath, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!isRedirecting || authLoading) return
    if (user && profile && dashboardPath) {
      router.replace(dashboardPath)
    }
  }, [user, profile, dashboardPath, authLoading, isRedirecting, router])

  const profileMissing = isRedirecting && !authLoading && Boolean(user) && !profile

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsRedirecting(false)
    setLoading(true)
    setError('')
    setNotice('')

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }
      setIsRedirecting(true)
    } catch {
      setError('We could not connect to Nava Udyog. Check your connection and try again.')
      setLoading(false)
    }
  }

  async function handleResetRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')
    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (resetError) {
        setError(resetError.message)
      } else {
        setNotice('If an account exists for that email, we’ve sent a password reset link. Check your inbox and spam folder.')
      }
    } catch {
      setError('We could not connect to Nava Udyog. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  function showResetForm() {
    setMode('reset')
    setError('')
    setNotice('')
  }

  return <div className="auth-page">
    <div className="auth-orbit" aria-hidden="true" />
    <div className="auth-shell">
      <div className="auth-heading">
        <Link href="/" className="auth-brand" aria-label="Nava Udyog home"><Logo /></Link>
        <p className="auth-kicker">{mode === 'login' ? 'Welcome back' : 'Account recovery'}</p>
        <h1>{mode === 'login' ? 'New job. New start.' : 'Reset your password.'}</h1>
        <p className="auth-description">{mode === 'login' ? 'Sign in to continue to your Nava Udyog account.' : 'Enter your account email and we’ll send you a secure reset link.'}</p>
      </div>

      <div className="auth-card">
        <form className="auth-form" onSubmit={mode === 'login' ? handleSubmit : handleResetRequest}>
          <div className="auth-field"><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" required placeholder="name@example.com" value={email} onChange={(event) => setEmail(event.target.value)} /></div>
          {mode === 'login' && <div className="auth-field"><div className="auth-password-row"><label htmlFor="password">Password</label><button type="button" onClick={showResetForm}>Forgot password?</button></div><input id="password" type="password" autoComplete="current-password" required placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} /></div>}
          {(error || profileMissing) && <div className="auth-alert" role="alert">{profileMissing ? 'Your account is signed in, but its worker or employer profile is missing. Please contact support.' : error}</div>}
          {notice && <div className="auth-notice" role="status">{notice}</div>}
          <button type="submit" disabled={loading} className="auth-submit">{loading ? (mode === 'login' ? 'Signing in…' : 'Sending link…') : (mode === 'login' ? 'Sign in' : 'Send reset link')} <span aria-hidden="true">→</span></button>
          {mode === 'login' ? <p className="auth-switch">Don&apos;t have an account? <Link href="/auth/register">Create one</Link></p> : <p className="auth-switch"><button type="button" onClick={() => { setMode('login'); setError(''); setNotice('') }}>Back to sign in</button></p>}
        </form>
      </div>
      <p className="auth-footnote">A better way to find work and workers.</p>
    </div>
  </div>
}
