import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user

  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  const isAuthRoute = nextUrl.pathname.startsWith('/login') ||
                      nextUrl.pathname.startsWith('/onboarding')
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth')

  // API Auth 경로는 항상 허용
  if (isApiAuthRoute) return NextResponse.next()

  // 비인증 사용자 → /login 리다이렉트
  if (!isLoggedIn && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  // 인증된 사용자가 로그인 페이지 접근 시 → 홈 또는 온보딩으로
  if (isLoggedIn && nextUrl.pathname === '/login') {
    const onboardingComplete = session.user.onboardingComplete
    return NextResponse.redirect(
      new URL(onboardingComplete ? '/' : '/onboarding', nextUrl)
    )
  }

  // 온보딩 미완료 사용자 → /onboarding 강제
  if (isLoggedIn && !session.user.onboardingComplete && !isAuthRoute) {
    return NextResponse.redirect(new URL('/onboarding', nextUrl))
  }

  // /admin 접근 — staff/super_admin 이외 차단 (코드 레벨 권한 강제)
  if (isAdminRoute) {
    const role = session?.user?.role
    if (role !== 'staff' && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/', nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
