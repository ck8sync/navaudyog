import { NextResponse, type NextRequest } from 'next/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /auth/callback
 * Exchanges a Supabase PKCE `?code=` or email `?token_hash=&type=` for a
 * session cookie and redirects to the target page (e.g. /auth/reset-password).
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const tokenHash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type') as EmailOtpType | null
  const nextParam = url.searchParams.get('next')
  const defaultNext = type === 'recovery' ? '/auth/reset-password' : '/'
  const nextPath = nextParam && nextParam.startsWith('/') ? nextParam : defaultNext

  const supabase = await createClient()

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (error) {
      const dest = new URL('/auth/reset-password', url.origin)
      dest.searchParams.set('error_description', error.message)
      return NextResponse.redirect(dest)
    }
    return NextResponse.redirect(new URL(nextPath, url.origin))
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      const dest = new URL('/auth/reset-password', url.origin)
      dest.searchParams.set('error_description', error.message)
      return NextResponse.redirect(dest)
    }
    return NextResponse.redirect(new URL(nextPath, url.origin))
  }

  return NextResponse.redirect(new URL(nextPath, url.origin))
}
