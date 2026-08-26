import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user

  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  const isOnboardingRoute = nextUrl.pathname.startsWith('/onboarding')
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

  // 3. 이미 온보딩까지 완료된 회원이 /login 또는 /onboarding 진입 시 ➔ 홈(/)으로 리다이렉트
  if (isLoggedIn && session.user.onboardingComplete && (nextUrl.pathname === '/login' || isOnboardingRoute)) {
    return NextResponse.redirect(new URL('/', nextUrl))
  }

  // 4. 구글 로그인 후 온보딩(닉네임/전화번호) 미완료 신규 사용자 ➔ 온보딩 강제 이동
  if (isLoggedIn && !session.user.onboardingComplete && !isOnboardingRoute && !nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/onboarding', nextUrl))
  }

  // 5. 비로그인 방문자는 랜딩페이지(/), 대회(/tournaments), 공지(/notices), 원장(/ledger) 모두 자유롭게 열람 가능!
  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sw\\.js|.*\\.(?:png|svg|ico|webmanifest)$).*)'],
}
