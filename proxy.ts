import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user

  const isAdminRoute = nextUrl.pathname.startsWith('/admin')

  // /admin 접근 — staff/super_admin만 허용
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl))
    }
    const role = session?.user?.role
    if (role !== 'staff' && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/', nextUrl))
    }
  }

  // 로그인된 사용자가 /login 진입 시 홈으로 리다이렉트
  if (isLoggedIn && nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|icon.svg|sw.js|manifest.webmanifest|.*\\.svg$|.*\\.png$|.*\\.jpg$).*)',
  ],
}
