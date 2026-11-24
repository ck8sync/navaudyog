'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import '@/app/auth/auth.css'

export default function ResetPasswordPage() {
  const [checkingSession, setCheckingSession] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [linkError, setLinkError] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let active = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return
      if (
        (event === 'PASSWORD_RECOVERY' ||
          event === 'SIGNED_IN' ||
          event === 'INITIAL_SESSION' ||
          event === 'TOKEN_REFRESHED') &&
        session
      ) {
        setHasSession(true)
        setLinkError('')
        setCheckingSession(false)
      }
    })

    async function verifyResetLink() {
      try {
        const searchParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))

        const urlError =
          searchParams.get('error_description') ||
          hashParams.get('error_description') ||
          searchParams.get('error') ||
          hashParams.get('error')

        if (urlError) {
          if (active) {
            setLinkError(urlError.replace(/\+/g, ' '))
            setHasSession(false)
            setCheckingSession(false)
          }
          return
        }

        const tokenHash = searchParams.get('token_hash')
        const type = searchParams.get('type')
        const code = searchParams.get('code')

        // 1. Handle ?token_hash=...&type=recovery links
        if (tokenHash && (type === 'recovery' || !type)) {
          const { data, error: otpError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery',
          })
          if (!active) return
          if (otpError) {
            setLinkError(otpError.message)
            setHasSession(false)
          } else {
            setHasSession(Boolean(data.session))
          }
          setCheckingSession(false)
          return
        }

        // 2. Check if a session already exists (or was auto-detected from URL)
        const { data: initialData } = await supabase.auth.getSession()
        if (!active) return
        if (initialData.session) {
          setHasSession(true)
          setCheckingSession(false)
          return
        }

        // 3. Handle PKCE ?code=... links if not yet exchanged
        if (code) {
          const { data: codeData, error: codeError } = await supabase.auth.exchangeCodeForSession(code)
          if (!active) return
          if (codeData?.session) {
            setHasSession(true)
            setCheckingSession(false)
            return
          }
          // The singleton client may have just finished exchanging the code; check getSession once more
          const { data: retryData } = await supabase.auth.getSession()
          if (!active) return
          if (retryData.session) {
            setHasSession(true)
          } else if (codeError) {
            setLinkError(codeError.message)
            setHasSession(false)
          }
          setCheckingSession(false)
          return
        }

        setHasSession(false)
        setCheckingSession(false)
      } catch {
        if (active) {
          setHasSession(false)
          setCheckingSession(false)
        }
      }
    }

    void verifyResetLink()
    return () => { active = false; subscription.unsubscribe() }
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
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
        </form> : <div className="auth-form"><div className="auth-alert" role="alert">{linkError || 'This reset link is invalid or has expired. Request a new one to continue.'}</div><Link className="auth-submit auth-link-button" href="/auth/login?mode=reset">Request a new link <span aria-hidden="true">→</span></Link></div>}
      </div>
      <p className="auth-footnote">Choose a password you haven&apos;t used before.</p>
    </div>
  </div>
}
