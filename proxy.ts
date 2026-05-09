import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  let role: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    role = profile?.role || null
  }

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard/employee') && role !== 'employee') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  if (pathname.startsWith('/dashboard/employer') && role !== 'employer') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Protect profile setup
  if (pathname === '/profile/employee' && role !== 'employee') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  if (pathname === '/profile/employer' && role !== 'employer') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Public routes: /, /jobs, /jobs/[id], /auth/login, /auth/register are allowed

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}