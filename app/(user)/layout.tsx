'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  Home,
  Crown,
  ReceiptText,
  Trophy,
  Megaphone,
  Bell,
  User,
  Sparkles,
  LogOut,
  ShieldCheck,
} from 'lucide-react'

interface UserLayoutProps {
  children: ReactNode
}

export default function UserLayout({ children }: UserLayoutProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const navItems = [
    {
      href: '/',
      label: '클럽홈',
      icon: Home,
      isActive: pathname === '/' || pathname === '',
    },
    {
      href: '/lounge',
      label: 'VIP라운지',
      icon: Crown,
      isActive: pathname.startsWith('/lounge'),
    },
    {
      href: '/ledger',
      label: '포인트원장',
      icon: ReceiptText,
      isActive: pathname.startsWith('/ledger'),
    },
    {
      href: '/tournaments',
      label: '대회안내',
      icon: Trophy,
      isActive: pathname.startsWith('/tournaments'),
    },
    {
      href: '/notices',
      label: '공지/소식',
      icon: Megaphone,
      isActive: pathname.startsWith('/notices'),
    },
  ]

  const isAdmin = session?.user?.role === 'staff' || session?.user?.role === 'super_admin'

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-white selection:bg-[#E6AF2E]/30">
      {/* Top Mobile & Desktop Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-[#E6AF2E]/20 border-t border-t-white/10 bg-gradient-to-b from-[#181A28]/95 via-[#0F1018]/95 to-[#08090D]/95 backdrop-blur-2xl shadow-xl">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-4 sm:px-6">
          {/* Logo & Store Location */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5D061] to-[#C28B1E] text-black font-serif font-black shadow-md shadow-yellow-500/20 group-hover:scale-105 transition-transform">
              ♠
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-lg font-black tracking-wider text-white">
                  FL<span className="text-[#F5D061]">♠</span>P
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#F5D061] font-bold px-1.5 py-0.5 rounded bg-[#E6AF2E]/10 border border-[#E6AF2E]/30">
                  원주 본점
                </span>
              </div>
              <p className="font-mono text-[8.5px] tracking-[0.2em] text-[#9CA3AF] -mt-1">
                PREMIUM POKER CLUB
              </p>
            </div>
          </Link>

          {/* Right Header Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1 rounded-xl border border-red-500/50 bg-red-950/40 px-2 py-1.5 text-xs font-bold text-red-300 hover:bg-red-900/50 transition-all shadow-md"
                title="관리자 콘솔"
              >
                <ShieldCheck className="size-3.5 text-red-400" />
                <span className="text-[11px] font-semibold hidden xs:inline">관리자</span>
              </Link>
            )}

            {session?.user ? (
              <>
                <Link
                  href="/lounge"
                  className="flex items-center gap-1.5 rounded-xl border border-[#F5D061]/40 bg-gradient-to-r from-[#282110] to-[#161824] px-2.5 py-1.5 text-xs text-[#F5D061] hover:border-[#F5D061] transition-all shadow-md"
                >
                  <Crown className="size-3.5 text-[#F5D061]" />
                  <span className="font-bold max-w-[70px] truncate">{session.user.name ?? '회원'}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-[#141624] text-[#9CA3AF] hover:text-rose-400 hover:border-rose-500/30 transition-all"
                  aria-label="로그아웃"
                  title="로그아웃"
                >
                  <LogOut className="size-3.5" />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 rounded-xl border border-[#E6AF2E]/30 bg-[#161824] px-2.5 py-1.5 text-xs font-bold text-[#F3E5AB] hover:border-[#E6AF2E] transition-all"
              >
                <User className="size-3.5" />
                <span>로그인</span>
              </Link>
            )}

            <Link
              href="/notices"
              className="relative flex size-9 items-center justify-center rounded-xl border border-[#E6AF2E]/20 bg-gradient-to-b from-[#1C1F2E] to-[#12131D] text-[#F3E5AB] hover:border-[#E6AF2E]/50 transition-all"
              aria-label="공지사항"
            >
              <Bell className="size-4" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[#E6AF2E] ring-2 ring-[#08090D] animate-pulse" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area (Max width fits 390px mobile up to desktop centered) */}
      <main className="mx-auto w-full max-w-lg flex-1 px-4 sm:px-6 pt-4 pb-24">
        {children}
      </main>

      {/* Fixed Bottom Tab Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E6AF2E]/20 bg-gradient-to-t from-[#08090D]/98 via-[#0F101A]/95 to-[#161826]/95 backdrop-blur-2xl pb-safe shadow-2xl">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all duration-200 ${
                  item.isActive
                    ? 'text-[#F5D061]'
                    : 'text-[#9CA3AF] hover:text-[#F3E5AB]'
                }`}
              >
                {/* Active Gold Indicator Pill */}
                {item.isActive && (
                  <div className="absolute -top-1 size-1 rounded-full bg-[#F5D061] shadow-lg shadow-yellow-400" />
                )}

                <div
                  className={`flex size-8 items-center justify-center rounded-xl transition-all ${
                    item.isActive
                      ? 'bg-[#E6AF2E]/15 border border-[#E6AF2E]/30 text-[#F5D061] scale-105'
                      : 'bg-transparent text-[#9CA3AF]'
                  }`}
                >
                  <Icon className="size-4" />
                </div>

                <span
                  className={`text-[9.5px] tracking-tight mt-0.5 font-medium ${
                    item.isActive ? 'font-bold text-[#F5D061]' : 'text-[#9CA3AF]'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
