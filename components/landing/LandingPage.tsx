'use client'

import Link from 'next/link'
import {
  Crown,
  ShieldCheck,
  Sparkles,
  Zap,
  QrCode,
  Trophy,
  ReceiptText,
  MapPin,
  Clock3,
  ChevronRight,
  Gift,
  CheckCircle2,
  ArrowRight,
  Flame
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TournamentCard } from '@/components/cards/TournamentCard'
import type { Tournament, NoticeEvent } from '@/types/database.types'

interface LandingPageProps {
  tournaments: Tournament[]
  pinnedNotice: NoticeEvent | null
}

export function LandingPage({ tournaments, pinnedNotice }: LandingPageProps) {
  const featuredTourney =
    tournaments.find((t) => t.status === 'REGISTRATION') ??
    tournaments.find((t) => t.status === 'LIVE') ??
    tournaments[0] ??
    null

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Hero Showcase Section */}
      <section className="relative overflow-hidden rounded-3xl border border-[#E6AF2E]/40 bg-gradient-to-b from-[#24273C] via-[#151624] to-[#0A0B12] p-6 sm:p-8 text-center text-white shadow-2xl shadow-yellow-500/10">
        {/* Background Ambient Glows */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 size-72 rounded-full bg-[#E6AF2E]/15 blur-3xl pointer-events-none" />
        <div className="shimmer-light pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E6AF2E]/40 bg-[#E6AF2E]/10 px-3.5 py-1 text-[11px] font-bold text-[#F5D061] shadow-sm">
            <Sparkles className="size-3.5" />
            <span>원주 No.1 프리미엄 홀덤 라운지</span>
          </div>

          {/* Headline */}
          <div className="space-y-1">
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              FLOP POKER CLUB
            </h1>
            <p className="font-sans text-sm sm:text-base text-[#F3E5AB] font-medium">
              격이 다른 홀덤 스포츠 & VIP 멤버십 원장
            </p>
          </div>

          {/* Subtitle */}
          <p className="mx-auto max-w-sm text-xs text-[#9CA3AF] leading-relaxed">
            투명한 포인트 원장 관리, 원터치 QR 출입 인증, 정기 토너먼트까지 스마트하게 즐기세요.
          </p>

          {/* Welcome Bonus Callout */}
          <div className="mx-auto max-w-xs rounded-2xl border border-[#E6AF2E]/30 bg-gradient-to-r from-[#2A2312] via-[#1E1C1A] to-[#12131C] p-3 shadow-md flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5D061] to-[#C28B1E] text-black font-black text-sm">
                <Gift className="size-4" />
              </div>
              <div className="text-left">
                <div className="text-[11px] font-bold text-[#F3E5AB]">신규 회원 가입 이벤트</div>
                <div className="text-xs font-black text-[#F5D061]">웰컴 5,000 P 즉시 지급</div>
              </div>
            </div>
            <Badge className="bg-[#E6AF2E]/20 text-[#F5D061] border-[#E6AF2E]/40 text-[10px]">
              무료
            </Badge>
          </div>

          {/* Main Sign-up CTA Button */}
          <div className="pt-2">
            <Link href="/login">
              <Button
                size="lg"
                className="h-13 w-full max-w-xs rounded-2xl bg-gradient-to-r from-[#F5D061] via-[#E6AF2E] to-[#C28B1E] text-black font-extrabold text-sm shadow-xl shadow-yellow-500/25 hover:scale-105 active:scale-95 transition-all"
              >
                <Crown className="size-4 mr-2" />
                VIP 멤버십 카드 발급받기
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </Link>
            <p className="mt-2 text-[10px] text-[#9CA3AF]">
              구글 간편 로그인으로 3초 만에 시작 (가입비 무료)
            </p>
          </div>
        </div>
      </section>

      {/* 2. Key Value Props (4대 핵심 가치) */}
      <section aria-label="클럽 특징" className="space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#9CA3AF] px-1">
          CLUB BENEFITS
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-[#E6AF2E]/20 bg-gradient-to-br from-[#181A28] to-[#0E1018] p-4 text-white space-y-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#E6AF2E]/10 text-[#F5D061]">
              <QrCode className="size-5" />
            </div>
            <h3 className="font-bold text-xs text-white">QR 원터치 체크인</h3>
            <p className="text-[11px] text-[#9CA3AF] leading-snug">
              출입과 동시에 포카드, 스티플 핸드 보너스 포인트 즉시 적립
            </p>
          </div>

          <div className="rounded-2xl border border-[#E6AF2E]/20 bg-gradient-to-br from-[#181A28] to-[#0E1018] p-4 text-white space-y-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#E6AF2E]/10 text-[#F5D061]">
              <Trophy className="size-5" />
            </div>
            <h3 className="font-bold text-xs text-white">실시간 토너먼트</h3>
            <p className="text-[11px] text-[#9CA3AF] leading-snug">
              데일리 & 빅 매치 토너먼트 일정 확인 및 원터치 참가 신청
            </p>
          </div>

          <div className="rounded-2xl border border-[#E6AF2E]/20 bg-gradient-to-br from-[#181A28] to-[#0E1018] p-4 text-white space-y-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#E6AF2E]/10 text-[#F5D061]">
              <ReceiptText className="size-5" />
            </div>
            <h3 className="font-bold text-xs text-white">투명한 불변 원장</h3>
            <p className="text-[11px] text-[#9CA3AF] leading-snug">
              모든 포인트 적립/차감 내역이 영구 보존되는 안전한 시스템
            </p>
          </div>

          <div className="rounded-2xl border border-[#E6AF2E]/20 bg-gradient-to-br from-[#181A28] to-[#0E1018] p-4 text-white space-y-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#E6AF2E]/10 text-[#F5D061]">
              <ShieldCheck className="size-5" />
            </div>
            <h3 className="font-bold text-xs text-white">100% 클린 합법 룰</h3>
            <p className="text-[11px] text-[#9CA3AF] leading-snug">
              환전 0%, 스포츠맨십과 매너를 중시하는 프리미엄 라운지
            </p>
          </div>
        </div>
      </section>

      {/* 3. Hand Bonus Table Preview */}
      <section aria-label="핸드 보너스 안내">
        <div className="rounded-2xl border border-[#E6AF2E]/30 bg-gradient-to-br from-[#241708] via-[#17130c] to-[#0d0c0a] p-4 text-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="size-4 text-[#F5D061]" />
              <h3 className="font-serif text-sm font-bold text-[#F3E5AB]">
                핸드 달성 시 즉시 포인트 적립
              </h3>
            </div>
            <Badge className="bg-[#E6AF2E]/20 text-[#F5D061] border-[#E6AF2E]/30 text-[10px]">
              EVENT
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl border border-[#E6AF2E]/20 bg-black/40 p-2.5 space-y-1">
              <div className="text-[11px] text-[#9CA3AF] font-medium">투핸드 포카드</div>
              <div className="font-mono text-sm font-extrabold text-[#F5D061]">+500 P</div>
            </div>
            <div className="rounded-xl border border-[#E6AF2E]/20 bg-black/40 p-2.5 space-y-1">
              <div className="text-[11px] text-[#9CA3AF] font-medium">스트레이트 플러시</div>
              <div className="font-mono text-sm font-extrabold text-[#F5D061]">+1,000 P</div>
            </div>
            <div className="rounded-xl border border-[#E6AF2E]/40 bg-[#E6AF2E]/10 p-2.5 space-y-1">
              <div className="text-[11px] text-[#F3E5AB] font-bold">로얄 플러시</div>
              <div className="font-mono text-sm font-black text-white">+3,000 P</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Tournament Preview */}
      {featuredTourney && (
        <section aria-label="진행 중인 토너먼트" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Trophy className="size-4 text-[#E6AF2E]" />
              <h2 className="text-sm font-bold text-white">실시간 토너먼트 프리뷰</h2>
            </div>
            <Link
              href="/tournaments"
              className="text-xs text-[#F5D061] hover:underline flex items-center"
            >
              전체보기 <ChevronRight className="size-3.5 ml-0.5" />
            </Link>
          </div>
          <TournamentCard tournament={featuredTourney} />
        </section>
      )}

      {/* 5. Location & Hours */}
      <section aria-label="매장 정보">
        <div className="rounded-2xl border border-[#E6AF2E]/20 bg-[#13141C] p-4 text-xs text-[#9CA3AF] space-y-2.5">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <MapPin className="size-4 text-[#E6AF2E]" />
            <span>FLOP POKER CLUB 원주점</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock3 className="size-3.5 text-[#E6AF2E]" />
            <span>영업 시간: 매일 18:00 ~ 익일 06:00 (연중무휴)</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#9CA3AF]">
            강원특별자치도 원주시 프리미엄 홀덤 라운지 · 전 좌석 최고급 테이블 & 전문 딜러 상주
          </p>
        </div>
      </section>

      {/* 6. Bottom Sticky CTA Bar */}
      <div className="sticky bottom-20 z-20 mx-auto max-w-lg">
        <div className="rounded-2xl border border-[#E6AF2E]/50 bg-gradient-to-r from-[#1F2233]/95 via-[#161824]/95 to-[#0E1018]/95 p-3 shadow-2xl shadow-black backdrop-blur-xl flex items-center justify-between gap-3">
          <div className="space-y-0.5 pl-1">
            <div className="text-xs font-bold text-white">가입 즉시 5,000P 지급</div>
            <div className="text-[10px] text-[#F3E5AB]">3초 간편 Google 로그인</div>
          </div>
          <Link href="/login">
            <Button
              size="sm"
              className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#C28B1E] text-black font-extrabold text-xs shadow-md shadow-yellow-500/20 hover:scale-105 transition-transform"
            >
              시작하기 <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
