import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const url = new URL(request.url)
  const path = url.pathname

  // Public routes
  const publicRoutes = ['/', '/jobs', '/auth/login', '/auth/register']
  if (publicRoutes.includes(path) || path.startsWith('/jobs/')) {
    return response
  }

  // Protected routes
  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Role-based protection
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    // If user has no profile but is logged in, they might need to set it up
    // But we should allow them to access profile setup pages
    if (path.startsWith('/profile/')) {
        return response
    }
    // Otherwise redirect to home or login (shouldn't happen with the trigger)
    return response
  }

  const role = profile.role

  if (path.startsWith('/dashboard/employee') && role !== 'employee') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  if (path.startsWith('/dashboard/employer') && role !== 'employer') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  if (path.startsWith('/dashboard/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  if (path === '/profile/employee' && role !== 'employee') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  if (path === '/profile/employer' && role !== 'employer') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
