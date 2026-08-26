import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user

  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth')

  // 1. API Auth 경로는 항상 허용
  if (isApiAuthRoute) return NextResponse.next()

  // 2. /admin 접근 — 비로그인 시 /login 리다이렉트, staff/super_admin 이외 홈으로 차단
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl))
    }
    const role = session?.user?.role
    if (role !== 'staff' && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/', nextUrl))
    }
  }

  // 3. 이미 온보딩까지 완료된 회원이 /login 진입 시 ➔ 홈(/)으로 리다이렉트
  if (isLoggedIn && session.user.onboardingComplete && nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', nextUrl))
  }

  // 4. 모든 사용자는 홈(/) 및 공개 페이지로 자유롭게 진입 가능 (강제 리다이렉트 없음)
  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sw\\.js|.*\\.(?:png|svg|ico|webmanifest)$).*)'],
}
