import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user

  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  const isAuthRoute =
    nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/onboarding')
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth')

  if (isApiAuthRoute) return NextResponse.next()

  // 비인증 사용자 → /login
  if (!isLoggedIn && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  // 이미 로그인된 사용자가 /login 접근 → 홈 또는 온보딩
  if (isLoggedIn && nextUrl.pathname === '/login') {
    return NextResponse.redirect(
      new URL(session.user.onboardingComplete ? '/' : '/onboarding', nextUrl)
    )
  }

  // 온보딩 미완료 → /onboarding 강제
  if (isLoggedIn && !session.user.onboardingComplete && !isAuthRoute) {
    return NextResponse.redirect(new URL('/onboarding', nextUrl))
  }

  // /admin — staff/super_admin 이외 차단
  if (isAdminRoute) {
    const role = session?.user?.role
    if (role !== 'staff' && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/', nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|ico|webmanifest)$).*)'],
}
