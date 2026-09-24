// proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {        // ← GANTI jadi 'proxy'
  const sessionToken = request.cookies.get('session_token')?.value

  // F2: Dashboard hanya bisa dibuka setelah login
  if (request.nextUrl.pathname.startsWith('/dashboard') && !sessionToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Kalau sudah login tapi buka /login atau /register → redirect ke dashboard
  if (
    (request.nextUrl.pathname === '/login' ||
      request.nextUrl.pathname === '/register') &&
    sessionToken
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
}