'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import '@/app/auth/auth.css'

export default function ResetPasswordPage() {
  const [checkingSession, setCheckingSession] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setHasSession(Boolean(data.session))
      setCheckingSession(false)
    }).catch(() => {
      if (active) setCheckingSession(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && active) setHasSession(Boolean(session))
    })
    return () => { active = false; subscription.unsubscribe() }
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('The passwords do not match. Please check them and try again.')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
        return
      }
      await supabase.auth.signOut()
      setComplete(true)
    } catch {
      setError('We could not update your password. Request a new reset link and try again.')
    } finally {
      setLoading(false)
    }
  }

  return <div className="auth-page">
    <div className="auth-orbit" aria-hidden="true" />
    <div className="auth-shell">
      <div className="auth-heading">
        <Link href="/" className="auth-brand" aria-label="Nava Udyog home"><Logo /></Link>
        <p className="auth-kicker">Account recovery</p>
        <h1>{complete ? 'Password updated.' : 'Choose a new password.'}</h1>
        <p className="auth-description">{complete ? 'Your password has been changed. Sign in with your new password to continue.' : 'Create a new password to get back to your account.'}</p>
      </div>

      <div className="auth-card">
        {checkingSession ? <p className="auth-description auth-state">Checking your reset link…</p> : complete ? <div className="auth-form"><div className="auth-notice" role="status">Your password has been updated successfully.</div><Link className="auth-submit auth-link-button" href="/auth/login">Back to sign in <span aria-hidden="true">→</span></Link></div> : hasSession ? <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field"><label htmlFor="password">New password</label><input id="password" type="password" autoComplete="new-password" minLength={8} required placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} /></div>
          <div className="auth-field"><label htmlFor="confirmPassword">Confirm new password</label><input id="confirmPassword" type="password" autoComplete="new-password" minLength={8} required placeholder="Enter the password again" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></div>
          {error && <div className="auth-alert" role="alert">{error}</div>}
          <button type="submit" disabled={loading} className="auth-submit">{loading ? 'Updating password…' : 'Update password'} <span aria-hidden="true">→</span></button>
        </form> : <div className="auth-form"><div className="auth-alert" role="alert">This reset link is invalid or has expired. Request a new one to continue.</div><Link className="auth-submit auth-link-button" href="/auth/login">Request a new link <span aria-hidden="true">→</span></Link></div>}
      </div>
      <p className="auth-footnote">Choose a password you haven&apos;t used before.</p>
    </div>
  </div>
}
