'use client'

import { useState } from 'react'
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
  Award,
  ArrowUpRight,
  Zap,
  Info
} from 'lucide-react'
import { GoldVIPCard } from '@/components/cards/GoldVIPCard'
import { TournamentCard } from '@/components/cards/TournamentCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Profile, Tournament, PointTransaction, NoticeEvent } from '@/types/database.types'
import { formatPoints, formatDateTime, getPointReasonMeta } from '@/lib/utils/format'

// Mock initial data for rich preview (ready for Server Actions hookup in Phase 3)
const mockProfile: Partial<Profile> = {
  id: 'usr-1',
  name: '김민준',
  nickname: 'AceKing',
  phone: '010-8888-9999',
  role: 'user',
  tier: 'VIP',
  qr_token: 'flp-99a8-7b2c-8841-f09c',
  total_points: 24500,
}

const mockPinnedNotice: NoticeEvent = {
  id: 'not-1',
  category: 'NOTICE',
  title: '♠ FLOP 원주점 3월 토너먼트 스케줄 및 핸드 보너스 안내',
  content: '회원 여러분을 위한 투핸드 포카드(+500P), 스티플(+1,000P), 로티플(+3,000P) 원터치 포인트 즉시 지급 혜택이 적용 중입니다. 매장 방문 시 QR 코드를 제시해 주세요.',
  is_pinned: true,
  author_id: 'admin-1',
  created_at: new Date().toISOString(),
}

const mockFeaturedTournament: Tournament = {
  id: 'tour-1',
  title: 'Friday Night High Roller 50K',
  description: '매주 금요일 정기 메인 이벤트! 블라인드 15분 / 30,000 딥스택',
  start_time: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(), // 3시간 후
  entry_point_cost: 50000,
  total_prize_points: 2500000,
  max_players: 30,
  current_players: 18,
  status: 'REGISTRATION',
  created_at: new Date().toISOString(),
}

const mockRecentTransactions: PointTransaction[] = [
  {
    id: 'tx-1',
    user_id: 'usr-1',
    amount: 500,
    balance_after: 24500,
    reason: 'FOUR_OF_A_KIND',
    description: 'A 포카드 투핸드 승리 보너스',
    processed_by: 'staff-1',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'tx-2',
    user_id: 'usr-1',
    amount: 1000,
    balance_after: 24000,
    reason: 'STRAIGHT_FLUSH',
    description: '다이아 스티플 완성 보너스',
    processed_by: 'staff-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'tx-3',
    user_id: 'usr-1',
    amount: 5000,
    balance_after: 23000,
    reason: 'EVENT_BONUS',
    description: '신규 멤버십 웰컴 보너스',
    processed_by: 'admin-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
]

export default function UserHomePage() {
  const [profile] = useState<Partial<Profile>>(mockProfile)
  const [pinnedNotice] = useState<NoticeEvent>(mockPinnedNotice)
  const [featuredTourney] = useState<Tournament>(mockFeaturedTournament)
  const [recentTx] = useState<PointTransaction[]>(mockRecentTransactions)

  return (
    <div className="space-y-6">
      {/* 1. Gold VIP Membership Card */}
      <section aria-label="멤버십 카드">
        <GoldVIPCard profile={profile} />
      </section>

      {/* 2. Pinned Notice Highlighting Banner */}
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
                    <span className="font-mono text-[9px] font-extrabold uppercase tracking-wider text-[#F5D061] px-1.5 py-0.2 rounded bg-[#E6AF2E]/15">
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
          <Link
            href="/ledger"
            className="flex flex-col items-center justify-center rounded-2xl border border-[#E6AF2E]/20 bg-[#13141C] p-3 hover:border-[#E6AF2E]/50 hover:bg-[#181A26] transition-all group"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#E6AF2E]/10 text-[#E6AF2E] group-hover:scale-110 transition-transform">
              <ReceiptText className="size-5" />
            </div>
            <span className="mt-2 text-[11px] font-semibold text-[#F3E5AB]">
              포인트원장
            </span>
          </Link>

          <Link
            href="/tournaments"
            className="flex flex-col items-center justify-center rounded-2xl border border-[#E6AF2E]/20 bg-[#13141C] p-3 hover:border-[#E6AF2E]/50 hover:bg-[#181A26] transition-all group"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#E6AF2E]/10 text-[#E6AF2E] group-hover:scale-110 transition-transform">
              <Trophy className="size-5" />
            </div>
            <span className="mt-2 text-[11px] font-semibold text-[#F3E5AB]">
              대회일정
            </span>
          </Link>

          <Link
            href="/notices?tab=RULE"
            className="flex flex-col items-center justify-center rounded-2xl border border-[#E6AF2E]/20 bg-[#13141C] p-3 hover:border-[#E6AF2E]/50 hover:bg-[#181A26] transition-all group"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#E6AF2E]/10 text-[#E6AF2E] group-hover:scale-110 transition-transform">
              <HelpCircle className="size-5" />
            </div>
            <span className="mt-2 text-[11px] font-semibold text-[#F3E5AB]">
              클럽룰북
            </span>
          </Link>

          <div
            className="flex flex-col items-center justify-center rounded-2xl border border-[#E6AF2E]/20 bg-[#13141C] p-3 hover:border-[#E6AF2E]/50 hover:bg-[#181A26] transition-all group cursor-pointer"
            onClick={() => alert('강원도 원주시 FLOP POKER CLUB (원주점)\n영업시간: 18:00 ~ 익일 06:00\n문의: 매장 카운터')}
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#E6AF2E]/10 text-[#E6AF2E] group-hover:scale-110 transition-transform">
              <MapPin className="size-5" />
            </div>
            <span className="mt-2 text-[11px] font-semibold text-[#F3E5AB]">
              매장위치
            </span>
          </div>
        </div>
      </section>

      {/* 4. Hand Bonus Promotion Banner */}
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

      {/* 5. Featured Tournament Spotlight */}
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

      {/* 6. Recent Point Transactions */}
      <section aria-label="최근 포인트 내역">
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
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                      {formatDateTime(tx.created_at, 'short')}
                      {tx.description && ` · ${tx.description}`}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-sm font-extrabold font-mono ${
                      tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
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

      {/* 7. Club Information Footer Card */}
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
