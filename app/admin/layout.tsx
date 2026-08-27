'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ScanLine,
  Users,
  Trophy,
  Megaphone,
  ShieldCheck,
  ArrowLeft,
  Lock,
  Flame,
  Store
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()

  const adminNavItems = [
    {
      href: '/admin',
      label: '운영대시보드',
      icon: LayoutDashboard,
      isActive: pathname === '/admin',
    },
    {
      href: '/admin/scanner',
      label: 'QR 스캐너',
      icon: ScanLine,
      isActive: pathname === '/admin/scanner',
    },
    {
      href: '/admin/members',
      label: '회원관리',
      icon: Users,
      isActive: pathname === '/admin/members',
    },
    {
      href: '/admin/tournaments',
      label: '토너먼트',
      icon: Trophy,
      isActive: pathname === '/admin/tournaments',
    },
    {
      href: '/admin/notices',
      label: '공지/이벤트',
      icon: Megaphone,
      isActive: pathname === '/admin/notices',
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-white selection:bg-[#E6AF2E]/30">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 border-b border-[#E6AF2E]/25 border-t border-t-white/10 bg-gradient-to-b from-[#1A1D2C]/95 via-[#11121C]/95 to-[#08090D]/95 backdrop-blur-2xl shadow-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          {/* Logo & Role Badge */}
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5D061] to-[#C28B1E] text-black font-serif font-black shadow-md shadow-yellow-500/20 group-hover:scale-105 transition-transform">
                ♠
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg font-black tracking-wider text-white">
                    FL<span className="text-[#F5D061]">♠</span>P
                  </span>
                  <Badge className="bg-red-500/20 text-red-300 border-red-500/40 text-[10px] font-bold px-1.5 py-0">
                    STAFF
                  </Badge>
                </div>
                <p className="font-mono text-[8.5px] tracking-[0.2em] text-[#9CA3AF] -mt-1">
                  원주 본점 운영 콘솔
                </p>
              </div>
            </Link>
          </div>

          {/* Quick Actions (Switch to Member View) */}
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-xl border-[#E6AF2E]/30 bg-gradient-to-b from-[#1C1F2E] to-[#12131D] text-xs text-[#F3E5AB] hover:border-[#E6AF2E]/60 transition-all"
              >
                <ArrowLeft className="size-3.5 mr-1" /> 회원 화면
              </Button>
            </Link>
          </div>
        </div>

        {/* Sub-Navigation Tabs Bar */}
        <div className="border-t border-[#E6AF2E]/15 bg-gradient-to-r from-[#141624]/90 via-[#0F101A]/90 to-[#141624]/90 overflow-x-auto no-scrollbar">
          <div className="mx-auto flex h-12 max-w-5xl items-center gap-1 px-4 sm:px-6">
            {adminNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    item.isActive
                      ? 'bg-gradient-to-r from-[#F5D061] to-[#E6AF2E] text-black shadow-md shadow-yellow-500/20 font-bold'
                      : 'text-[#9CA3AF] hover:text-[#F3E5AB] hover:bg-[#181A26]'
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6 py-6 pb-20">
        {children}
      </main>
    </div>
  )
}
