import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return new NextResponse(
      `<html><body style="font-family:sans-serif;padding:2rem;background:#121214;color:#f3f4f6;">
        <h1 style="color:#ef4444;">Configuration Error</h1>
        <p>Supabase environment variables are missing on Vercel.</p>
        <p>Please ensure you have configured <strong>NEXT_PUBLIC_SUPABASE_URL</strong> and <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong> in your Vercel Project Settings.</p>
      </body></html>`,
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      }
    )
  }

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  try {
    const { data: { user } } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    // Protect dashboard routes
    const protectedRoutes = ['/dashboard', '/offers', '/transactions', '/withdraw']
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

    if (isProtectedRoute && !user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Protect admin routes
    if (pathname.startsWith('/admin')) {
      if (!user) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      // Check admin status via DB
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Redirect logged-in users away from auth pages
    if ((pathname === '/login' || pathname === '/signup') && user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return supabaseResponse
  } catch (error: any) {
    return new NextResponse(
      `<html><body style="font-family:sans-serif;padding:2rem;background:#121214;color:#f3f4f6;">
        <h1 style="color:#ef4444;">Runtime Error inside Proxy</h1>
        <p>An error occurred while executing the proxy logic:</p>
        <pre style="background:#1e1e24;padding:1rem;border-radius:4px;overflow-x:auto;color:#ef4444;">${error?.message || error}</pre>
      </body></html>`,
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      }
    )
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/postback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
