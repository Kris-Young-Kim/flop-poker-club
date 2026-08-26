'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Trophy,
  Megaphone,
  ReceiptText,
  Sparkles,
  ChevronRight,
  Flame,
  Clock3,
  MapPin,
  HelpCircle,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { GoldVIPCard } from '@/components/cards/GoldVIPCard'
import { TournamentCard } from '@/components/cards/TournamentCard'
import { Badge } from '@/components/ui/badge'
import type { Profile, Tournament, PointTransaction, NoticeEvent } from '@/types/database.types'
import { formatPoints, formatDateTime, getPointReasonMeta } from '@/lib/utils/format'
import { getCurrentProfile } from '@/lib/actions/user'
import { toast } from 'sonner'
import { getMyTransactions } from '@/lib/actions/ledger'
import { getTournaments } from '@/lib/actions/tournaments'
import { getNotices } from '@/lib/actions/notices'

export default function UserHomePage() {
  const [profile, setProfile] = useState<Partial<Profile> | null>(null)
  const [pinnedNotice, setPinnedNotice] = useState<NoticeEvent | null>(null)
  const [featuredTourney, setFeaturedTourney] = useState<Tournament | null>(null)
  const [recentTx, setRecentTx] = useState<PointTransaction[]>([])

  useEffect(() => {
    getCurrentProfile().then((p) => setProfile(p))

    getNotices().then((notices) => {
      const pinned = notices.find((n) => n.is_pinned) ?? notices[0] ?? null
      setPinnedNotice(pinned)
    })

    getTournaments().then((tourneys) => {
      const featured =
        tourneys.find((t) => t.status === 'REGISTRATION') ??
        tourneys.find((t) => t.status === 'LIVE') ??
        tourneys[0] ??
        null
      setFeaturedTourney(featured)
    })

    getMyTransactions(3).then(setRecentTx)
  }, [])

  return (
    <div className="space-y-6">
      {/* 1. Gold VIP Membership Card */}
      <section aria-label="멤버십 카드">
        <GoldVIPCard profile={profile ?? {}} />
      </section>

      {/* 2. Pinned Notice */}
      {pinnedNotice && (
        <section aria-label="필독 공지">
          <Link href="/notices">
            <div className="relative overflow-hidden rounded-2xl border border-[#E6AF2E]/30 bg-gradient-to-r from-[#1E1B13] via-[#161720] to-[#12131A] p-3.5 sm:p-4 shadow-lg shadow-yellow-500/5 hover:border-[#E6AF2E]/60 transition-all flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5D061] to-[#E6AF2E] text-black shadow">
                  <Megaphone className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[9px] font-extrabold uppercase tracking-wider text-[#F5D061] px-1.5 rounded bg-[#E6AF2E]/15">
                      공지
                    </span>
                    <span className="text-xs font-bold text-white truncate group-hover:text-[#F3E5AB] transition-colors">
                      {pinnedNotice.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9CA3AF] truncate mt-0.5">
                    {pinnedNotice.content}
                  </p>
                </div>
              </div>
              <ChevronRight className="size-4 text-[#F5D061] shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </section>
      )}

      {/* 3. Quick Action Shortcuts */}
      <section aria-label="빠른 메뉴">
        <div className="grid grid-cols-4 gap-2.5">
          {[
            { href: '/ledger', icon: <ReceiptText className="size-5" />, label: '포인트원장' },
            { href: '/tournaments', icon: <Trophy className="size-5" />, label: '대회일정' },
            { href: '/notices?tab=RULE', icon: <HelpCircle className="size-5" />, label: '클럽룰북' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center rounded-2xl border border-[#E6AF2E]/20 bg-[#13141C] p-3 hover:border-[#E6AF2E]/50 hover:bg-[#181A26] transition-all group"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#E6AF2E]/10 text-[#E6AF2E] group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <span className="mt-2 text-[11px] font-semibold text-[#F3E5AB]">{item.label}</span>
            </Link>
          ))}
          <div
            className="flex flex-col items-center justify-center rounded-2xl border border-[#E6AF2E]/20 bg-[#13141C] p-3 hover:border-[#E6AF2E]/50 hover:bg-[#181A26] transition-all group cursor-pointer"
            onClick={() => toast.info('강원도 원주시 FLOP POKER CLUB (원주점) · 영업시간: 18:00 ~ 익일 06:00')}
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#E6AF2E]/10 text-[#E6AF2E] group-hover:scale-110 transition-transform">
              <MapPin className="size-5" />
            </div>
            <span className="mt-2 text-[11px] font-semibold text-[#F3E5AB]">매장위치</span>
          </div>
        </div>
      </section>

      {/* 4. Hand Bonus Banner */}
      <section aria-label="핸드 보너스 안내">
        <div className="relative overflow-hidden rounded-2xl border border-[#E6AF2E]/30 bg-gradient-to-br from-[#241708] via-[#17130c] to-[#0d0c0a] p-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-[#F5D061]" />
              <h3 className="font-serif text-sm font-bold tracking-wide text-[#F3E5AB]">
                원터치 핸드 보너스 안내
              </h3>
            </div>
            <Badge className="bg-[#E6AF2E]/20 text-[#F5D061] border-[#E6AF2E]/30 text-[10px]">
              즉시 적립
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl bg-[#13141C]/80 p-2 border border-emerald-500/20">
              <p className="text-[10px] text-[#9CA3AF]">투핸드 포카드</p>
              <p className="text-xs sm:text-sm font-extrabold text-emerald-400 mt-0.5">+500 P</p>
            </div>
            <div className="rounded-xl bg-[#13141C]/80 p-2 border border-purple-500/20">
              <p className="text-[10px] text-[#9CA3AF]">스트레이트 플러시</p>
              <p className="text-xs sm:text-sm font-extrabold text-purple-400 mt-0.5">+1,000 P</p>
            </div>
            <div className="rounded-xl bg-[#13141C]/80 p-2 border border-amber-500/20">
              <p className="text-[10px] text-[#9CA3AF]">로열 스트레이트 플러시</p>
              <p className="text-xs sm:text-sm font-extrabold text-[#F5D061] mt-0.5">+3,000 P</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured Tournament */}
      {featuredTourney && (
        <section aria-label="추천 대회">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="size-4 text-[#E6AF2E]" />
              <h2 className="font-serif text-base font-bold text-white tracking-wide">
                오늘의 주요 토너먼트
              </h2>
            </div>
            <Link
              href="/tournaments"
              className="text-xs text-[#F5D061] hover:text-[#FFF0A5] flex items-center gap-0.5 font-medium"
            >
              전체 대회 <ChevronRight className="size-3" />
            </Link>
          </div>
          <TournamentCard tournament={featuredTourney} />
        </section>
      )}

      {/* 6. Recent Transactions */}
      {recentTx.length > 0 && (
        <section aria-label="최근 포인트 활동">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-[#E6AF2E]" />
              <h2 className="font-serif text-base font-bold text-white tracking-wide">
                최근 포인트 활동
              </h2>
            </div>
            <Link
              href="/ledger"
              className="text-xs text-[#F5D061] hover:text-[#FFF0A5] flex items-center gap-0.5 font-medium"
            >
              원장 전체보기 <ChevronRight className="size-3" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {recentTx.map((tx) => {
              const meta = getPointReasonMeta(tx.reason)
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-2xl border border-[#E6AF2E]/15 bg-[#13141C] p-3.5 hover:border-[#E6AF2E]/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-[#181A26] border border-[#E6AF2E]/20 text-[#F5D061]">
                      <Zap className="size-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white">{meta.label}</span>
                      <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                        {formatDateTime(tx.created_at, 'short')}
                        {tx.description && ` · ${tx.description}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-extrabold font-mono ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatPoints(tx.amount, true)}
                    </p>
                    <p className="text-[10px] text-[#9CA3AF] font-mono mt-0.5">
                      잔액 {formatPoints(tx.balance_after)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="rounded-2xl border border-[#E6AF2E]/10 bg-[#0F1017] p-4 text-center text-xs text-[#9CA3AF] space-y-1">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#F3E5AB]/70 font-semibold">
          FLOP POKER CLUB · WONJU VIP LOUNGE
        </p>
        <p className="text-[11px]">
          공정한 홀덤 스포츠 문화와 프리미엄 멤버십 서비스를 제공합니다.
        </p>
      </footer>
    </div>
  )
}
