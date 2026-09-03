'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  QrCode,
  Sparkles,
  TrendingUp,
  Zap,
  ArrowRight,
  ShieldCheck,
  Megaphone,
  ChevronRight,
  Clock3,
} from 'lucide-react'
import { GoldVIPCard } from '@/components/cards/GoldVIPCard'
import { TournamentPrizeBoard } from '@/components/cards/TournamentPrizeBoard'
import { ClubPolicySummary } from '@/components/cards/ClubPolicySummary'
import { MemberQRModal } from '@/components/qr/MemberQRModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Profile, Tournament, PointTransaction, NoticeEvent } from '@/types/database.types'
import { formatPoints, formatDateTime, getPointReasonMeta } from '@/lib/utils/format'
import { getCurrentProfile } from '@/lib/actions/user'
import { getMyTransactions } from '@/lib/actions/ledger'
import { BUSINESS_INFO } from '@/lib/constants/business'

interface CompactClubHomeProps {
  initialTournaments?: Tournament[]
  initialNotice?: NoticeEvent | null
}

export function CompactClubHome({ initialTournaments = [], initialNotice = null }: CompactClubHomeProps) {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<Partial<Profile> | null>(null)
  const [recentTx, setRecentTx] = useState<PointTransaction[]>([])
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      getCurrentProfile()
        .then((p) => {
          setProfile(p)
          if (p) {
            getMyTransactions(5).then(setRecentTx).catch(() => {})
          }
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [session])

  const isLoggedIn = !!session?.user
  const isAdmin = profile?.role === 'staff' || profile?.role === 'super_admin' || session?.user?.role === 'staff' || session?.user?.role === 'super_admin'
  const isOnboardingIncomplete = isLoggedIn && (!profile?.nickname || !profile?.phone)

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* 1. Admin Quick Access Banner (Only for Staff / Super Admin) */}
      {isAdmin && (
        <Link href="/admin" className="block">
          <div className="flex items-center justify-between rounded-2xl border border-red-500/40 bg-gradient-to-r from-red-950/40 via-[#181216] to-[#12131F] p-3 text-red-300 shadow-lg hover:border-red-500/70 transition-all group">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-red-500/20 text-red-400">
                <ShieldCheck className="size-4" />
              </div>
              <span className="text-xs font-bold">관리자 운영 콘솔 (QR 스캐너 / 포인트 충전)</span>
            </div>
            <ChevronRight className="size-4 text-red-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      )}

      {/* 2. Onboarding Incomplete Alert */}
      {isOnboardingIncomplete && (
        <Link href="/onboarding" className="block">
          <div className="flex items-center justify-between rounded-2xl border border-[#F5D061] bg-gradient-to-r from-[#2B2310] to-[#12131C] p-3 text-white shadow-xl hover:border-[#FFF0A5] transition-all group">
            <div className="flex items-center gap-2.5">
              <Sparkles className="size-4 text-[#F5D061]" />
              <span className="text-xs font-bold text-[#F3E5AB]">
                신규 가입 웰컴 500 P 받기 (프로필 등록)
              </span>
            </div>
            <ChevronRight className="size-4 text-[#F5D061] group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      )}

      {/* 3. Main Points & QR Card Section */}
      <section aria-label="내 포인트 및 QR">
        {isLoggedIn ? (
          <GoldVIPCard
            profile={profile ?? { name: session.user.name ?? '회원', total_points: 0 }}
            onOpenQR={() => setQrModalOpen(true)}
          />
        ) : (
          /* Guest Card */
          <div className="relative overflow-hidden rounded-3xl border border-[#E6AF2E]/40 bg-gradient-to-br from-[#242738] via-[#161722] to-[#0A0B10] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5D061] to-[#C28B1E] text-black font-black text-sm shadow">
                  ♠
                </div>
                <div>
                  <h2 className="font-serif text-base font-black text-white">FLOP POKER CLUB</h2>
                  <p className="text-[11px] text-[#9CA3AF]">원주 본점 공식 멤버십</p>
                </div>
              </div>
              <Badge className="bg-[#E6AF2E]/20 text-[#F5D061] border border-[#E6AF2E]/30 text-[10px]">
                신규 500P 증정
              </Badge>
            </div>

            <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
              가입 즉시 <strong>500 P</strong>가 적립되며, 전용 QR 코드로 매장 포인트 충전 및 사용이 가능합니다.
            </p>

            <Link href="/login" className="block w-full">
              <Button className="w-full h-11 rounded-xl bg-gradient-to-r from-[#F5D061] via-[#E6AF2E] to-[#C28B1E] text-black font-extrabold text-xs shadow-lg shadow-yellow-500/25 hover:opacity-95 transition-all">
                <QrCode className="size-4 mr-1.5" />
                <span>내 QR 발급 & 500 P 받기 (간편 로그인)</span>
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* 4. Pinned Notice (공지사항) */}
      {initialNotice && (
        <section aria-label="공지사항">
          <Link href="/notices">
            <div className="flex items-center justify-between rounded-2xl border border-[#E6AF2E]/25 bg-[#13141C] p-3 shadow-md hover:border-[#E6AF2E]/50 transition-all group">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#E6AF2E]/15 text-[#F5D061]">
                  <Megaphone className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-[#E6AF2E]/20 text-[#F5D061]">
                      공지
                    </span>
                    <span className="text-xs font-bold text-white truncate group-hover:text-[#F3E5AB]">
                      {initialNotice.title}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="size-3.5 text-[#F5D061] shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </section>
      )}

      {/* 5. Tournament Prize Board (대회 공식 시상 공지) */}
      <section aria-label="대회 시상 공지">
        <TournamentPrizeBoard />
      </section>

      {/* 6. Club Policy Summary (포인트 적립 정책표) */}
      <section aria-label="포인트 정책표">
        <ClubPolicySummary />
      </section>

      {/* 7. Recent Transactions (로그인 사용자 최근 원장) */}
      {isLoggedIn && recentTx.length > 0 && (
        <section aria-label="최근 포인트 변동" className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-[#E6AF2E]" />
              <h3 className="font-serif text-sm font-bold text-white tracking-wide">
                최근 포인트 내역
              </h3>
            </div>
            <Link
              href="/ledger"
              className="text-xs text-[#F5D061] hover:text-[#FFF0A5] flex items-center gap-0.5 font-medium"
            >
              원장 전체보기 <ChevronRight className="size-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {recentTx.slice(0, 3).map((tx) => {
              const meta = getPointReasonMeta(tx.reason)
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#141520] p-3 hover:border-[#E6AF2E]/30 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-[#181A26] border border-[#E6AF2E]/20 text-[#F5D061]">
                      <Zap className="size-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white">{meta.label}</span>
                      <p className="text-[10px] text-[#9CA3AF] mt-0.5 font-mono">
                        {formatDateTime(tx.created_at, 'short')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-xs sm:text-sm font-black font-mono ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
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

      {/* Standalone QR Modal */}
      {profile && (
        <MemberQRModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          profile={profile}
        />
      )}

      {/* Minimal Footer */}
      <footer className="pt-2 text-center text-[10px] text-zinc-500 space-y-1 border-t border-white/5">
        <p className="font-mono uppercase tracking-wider text-[#F3E5AB]/60 font-semibold">
          FL♠P POKER CLUB · WONJU
        </p>
        <p>
          {BUSINESS_INFO.companyName} · 사업자등록번호 {BUSINESS_INFO.businessNumber} · 대표 {BUSINESS_INFO.representative}
        </p>
        <p className="text-zinc-600">{BUSINESS_INFO.address}</p>
      </footer>
    </div>
  )
}
