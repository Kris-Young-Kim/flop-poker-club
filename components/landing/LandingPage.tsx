'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
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
  Flame,
  Star,
  Users,
  Award,
  HelpCircle,
  PhoneCall,
  ChevronDown,
  Volume2,
  BadgeCheck,
  CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TournamentCard } from '@/components/cards/TournamentCard'
import { BUSINESS_INFO } from '@/lib/constants/business'
import type { Tournament, NoticeEvent } from '@/types/database.types'

interface LandingPageProps {
  tournaments: Tournament[]
  pinnedNotice: NoticeEvent | null
}

export function LandingPage({ tournaments, pinnedNotice }: LandingPageProps) {
  const { data: session } = useSession()
  const [selectedTier, setSelectedTier] = useState<'NORMAL' | 'VIP' | 'VVIP' | 'ROYAL'>('VIP')
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  const featuredTourneys = tournaments.slice(0, 3)

  const tierDetails = {
    NORMAL: {
      name: 'NORMAL',
      desc: '신규 가입 즉시 발급되는 기본 멤버십',
      bonus: '기본 포인트 적립',
      discount: '음료 5% 상시 할인',
      entry: '일반 토너먼트 참가',
      badgeColor: 'from-[#A1A1AA] to-[#71717A]',
      textColor: 'text-zinc-300',
    },
    VIP: {
      name: 'GOLD VIP',
      desc: '월 5회 이상 방문 우수 회원',
      bonus: '핸드 보너스 +10% 추가 적립',
      discount: '음료 & 사이드 10% 할인',
      entry: 'VIP 전용 프리롤 토너먼트 참가권',
      badgeColor: 'from-[#F5D061] via-[#E6AF2E] to-[#C28B1E]',
      textColor: 'text-[#F5D061]',
    },
    VVIP: {
      name: 'PLATINUM VVIP',
      desc: '월 15회 이상 방문 VIP 하이롤러',
      bonus: '핸드 보너스 +20% 추가 적립',
      discount: '전 메뉴 15% 할인 + 전용 락커',
      entry: '월간 챔피언십 시드권 우선 배정',
      badgeColor: 'from-[#E0E7FF] via-[#818CF8] to-[#4338CA]',
      textColor: 'text-indigo-300',
    },
    ROYAL: {
      name: 'BLACK ROYAL',
      desc: '클럽 최상위 명예 랭커 전용',
      bonus: '핸드 보너스 +30% 최고 적립',
      discount: '전 메뉴 무료 케이터링 & 발렛',
      entry: '연간 파이널 마스터스 초청권',
      badgeColor: 'from-[#FCD34D] via-[#B45309] to-[#78350F]',
      textColor: 'text-amber-300',
    },
  }

  const faqs = [
    {
      q: '홀덤을 처음 접하는 초보자도 방문할 수 있나요?',
      a: '네, 물론입니다! FLOP POKER CLUB은 초보자를 위한 친절한 무료 룰 코칭 테이블을 운영하고 있습니다. 딜러와 스태프가 기초 족보부터 베팅 매너까지 1:1로 친절히 안내해 드립니다.',
    },
    {
      q: '포인트는 어떻게 적립되고 어디에 사용하나요?',
      a: '포인트는 투핸드 포카드, 스트레이트 플러시, 로열 플러시 등 핸드 달성 시 QR 스캔을 통해 즉시 지급되며, 매장 내 식음료 이용 및 정기 토너먼트 참가 신청 시 사용하실 수 있습니다.',
    },
    {
      q: '토너먼트 참가 신청은 어떻게 하나요?',
      a: '구글 간편 로그인 후 [대회안내] 탭에서 원하는 일시의 토너먼트를 선택하고 [참가 신청] 버튼을 누르면 보유 포인트로 즉시 등록됩니다.',
    },
    {
      q: '매장 위치와 주차는 가능한가요?',
      a: `${BUSINESS_INFO.address}에 위치하고 있으며, 매장 인근 주변 주차가 가능합니다.`,
    },
  ]

  return (
    <div className="space-y-16 pb-24 text-white overflow-hidden selection:bg-[#E6AF2E]/40">
      
      {/* 0. Top Live Ticker Bar (Seamless Continuous Electronic Marquee) */}
      <div className="relative -mx-4 sm:-mx-6 -mt-4 overflow-hidden border-b border-[#E6AF2E]/30 bg-gradient-to-r from-[#211B0C] via-[#151724] to-[#211B0C] pt-3 pb-2.5 text-xs text-[#F3E5AB] shadow-lg select-none">
        <div className="flex shrink-0 items-center gap-6 animate-marquee whitespace-nowrap text-[11.5px] leading-normal font-medium py-0.5">
          <div className="flex items-center gap-3.5 shrink-0">
            <span className="inline-flex items-center gap-1 font-bold text-[#F5D061] px-2 py-0.5 rounded-full bg-[#E6AF2E]/25 border border-[#E6AF2E]/40 text-[10.5px] shrink-0">
              <Flame className="size-3.5 text-[#F5D061]" /> LIVE
            </span>
            <span className="inline-block pt-0.5">♠ 웰컴 이벤트: 신규 가입 즉시 5,000P 무료 지급</span>
            <span className="text-[#E6AF2E]/40">|</span>
            <span className="inline-block pt-0.5">🏆 매일 저녁 7시 데일리 토너먼트 START</span>
            <span className="text-[#E6AF2E]/40">|</span>
            <span className="inline-block pt-0.5">⚡ 투핸드 포카드 +500P · 스티플 +1,000P · 로티플 +3,000P 즉시 적립</span>
            <span className="text-[#E6AF2E]/40">|</span>
            <span className="inline-block pt-0.5">👑 원주 최고급 VIP 라운지 18:00 ~ 익일 06:00 연중무휴</span>
          </div>

          {/* 무한 루프를 위한 복제 트랙 */}
          <div className="flex items-center gap-3.5 shrink-0" aria-hidden="true">
            <span className="inline-flex items-center gap-1 font-bold text-[#F5D061] px-2 py-0.5 rounded-full bg-[#E6AF2E]/25 border border-[#E6AF2E]/40 text-[10.5px] shrink-0">
              <Flame className="size-3.5 text-[#F5D061]" /> LIVE
            </span>
            <span className="inline-block pt-0.5">♠ 웰컴 이벤트: 신규 가입 즉시 5,000P 무료 지급</span>
            <span className="text-[#E6AF2E]/40">|</span>
            <span className="inline-block pt-0.5">🏆 매일 저녁 7시 데일리 토너먼트 START</span>
            <span className="text-[#E6AF2E]/40">|</span>
            <span className="inline-block pt-0.5">⚡ 투핸드 포카드 +500P · 스티플 +1,000P · 로티플 +3,000P 즉시 적립</span>
            <span className="text-[#E6AF2E]/40">|</span>
            <span className="inline-block pt-0.5">👑 원주 최고급 VIP 라운지 18:00 ~ 익일 06:00 연중무휴</span>
          </div>
        </div>
      </div>

      {/* 1. Ultra Luxury Hero Section */}
      <section className="relative -mx-4 sm:-mx-6 -mt-8 overflow-hidden rounded-b-[40px] border-b border-[#E6AF2E]/40 bg-[#08090D]">
        {/* Cinematic Background Image */}
        <div className="relative h-[480px] sm:h-[540px] w-full">
          <Image
            src="/images/hero-lounge.jpg"
            alt="FLOP VIP Lounge Table"
            fill
            priority
            className="object-cover object-center brightness-[0.45] scale-105 transform hover:scale-100 transition-transform duration-1000"
          />
          {/* Obsidian Gradient Mask */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-[#08090D]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08090D]/90 via-transparent to-[#08090D]/90" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 size-96 rounded-full bg-[#E6AF2E]/15 blur-3xl pointer-events-none" />

          {/* Hero Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 text-center items-center space-y-5">
            {/* Crown Pill */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#F5D061]/50 bg-gradient-to-r from-[#2A2312]/90 to-[#181A28]/90 px-4 py-1.5 text-xs font-bold text-[#F5D061] shadow-xl backdrop-blur-md"
            >
              <Crown className="size-4 text-[#F5D061]" />
              <span>WONJU NO.1 HIGH ROLLER POKER CLUB</span>
            </motion.div>

            {/* Main Hero Headline */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="space-y-2 max-w-lg"
            >
              <h1 className="font-serif text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                FLOP POKER CLUB
              </h1>
              <p className="text-base sm:text-xl text-[#F3E5AB] font-bold tracking-wide break-keep">
                격이 다른 품격, 가장 완벽한 홀덤 스포츠 라운지
              </p>
            </motion.div>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-md text-xs sm:text-sm text-zinc-300 leading-relaxed break-keep px-2"
            >
              투명한 포인트 불변 원장, 원터치 QR 출입 인증부터 데일리 & 빅 토너먼트까지 스마트 모바일 멤버십으로 즐기세요.
            </motion.p>

            {/* Welcome Bonus Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="w-full max-w-sm rounded-2xl border border-[#F5D061]/40 bg-gradient-to-r from-[#241E10]/90 via-[#181A28]/90 to-[#10121C]/90 p-3.5 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5D061] to-[#C28B1E] text-black font-black shadow-lg">
                  <Gift className="size-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">신규 회원 가입 프로모션</div>
                  <div className="text-sm font-extrabold text-[#F5D061]">웰컴 5,000 P 즉시 지급</div>
                </div>
              </div>
              <Badge className="bg-[#E6AF2E] text-black font-extrabold text-[10px] px-2 py-0.5 shadow">
                FREE
              </Badge>
            </motion.div>

            {/* Hero CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="w-full max-w-sm flex flex-col sm:flex-row gap-2.5 pt-1"
            >
              {session?.user ? (
                <Link href="/lounge" className="flex-1">
                  <Button
                    size="lg"
                    className="h-13 w-full rounded-2xl bg-gradient-to-r from-[#F5D061] via-[#E6AF2E] to-[#C28B1E] text-black font-black text-sm shadow-xl shadow-yellow-500/30 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Crown className="size-4 mr-2" />
                    내 VIP 라운지 입장하기
                  </Button>
                </Link>
              ) : (
                <Link href="/login" className="flex-1">
                  <Button
                    size="lg"
                    className="h-13 w-full rounded-2xl bg-gradient-to-r from-[#F5D061] via-[#E6AF2E] to-[#C28B1E] text-black font-black text-sm shadow-xl shadow-yellow-500/30 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Crown className="size-4 mr-2" />
                    VIP 멤버십 카드 발급받기
                  </Button>
                </Link>
              )}
              <Link href="/tournaments">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 px-5 rounded-2xl border-[#E6AF2E]/40 bg-[#141624]/80 text-[#F3E5AB] hover:border-[#E6AF2E] hover:bg-[#1C1F32] transition-all text-xs font-bold"
                >
                  대회일정 보기
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Live Key Stats Banner */}
      <section className="grid grid-cols-3 gap-2.5 sm:gap-4 text-center">
        <div className="rounded-2xl border border-[#E6AF2E]/20 bg-gradient-to-b from-[#181A28] to-[#0E1018] p-4 shadow-xl">
          <p className="font-mono text-[10px] uppercase text-[#9CA3AF]">TOTAL PRIZE</p>
          <p className="font-mono text-base sm:text-xl font-black text-[#F5D061] mt-1">120M+ P</p>
          <p className="text-[10px] text-[#9CA3AF] mt-0.5">누적 상금 포인트</p>
        </div>
        <div className="rounded-2xl border border-[#E6AF2E]/20 bg-gradient-to-b from-[#181A28] to-[#0E1018] p-4 shadow-xl">
          <p className="font-mono text-[10px] uppercase text-[#9CA3AF]">VIP MEMBERS</p>
          <p className="font-mono text-base sm:text-xl font-black text-white mt-1">1,850+ 명</p>
          <p className="text-[10px] text-[#9CA3AF] mt-0.5">원주 정회원 등록</p>
        </div>
        <div className="rounded-2xl border border-[#E6AF2E]/20 bg-gradient-to-b from-[#181A28] to-[#0E1018] p-4 shadow-xl">
          <p className="font-mono text-[10px] uppercase text-[#9CA3AF]">DAILY MATCH</p>
          <p className="font-mono text-base sm:text-xl font-black text-emerald-400 mt-1">매일 4회</p>
          <p className="text-[10px] text-[#9CA3AF] mt-0.5">정기 토너먼트</p>
        </div>
      </section>

      {/* 3. 3D Floating VIP Card Showcase */}
      <section className="relative overflow-hidden rounded-3xl border border-[#E6AF2E]/30 bg-gradient-to-b from-[#1C1F32] via-[#12131F] to-[#08090D] p-5 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2.5 text-center sm:text-left flex-1 min-w-0">
            <div className="flex items-center justify-center sm:justify-start">
              <Badge className="bg-[#E6AF2E]/15 text-[#F5D061] border border-[#E6AF2E]/30 text-[10px] font-bold px-2 py-0.5 tracking-wider">
                MEMBERSHIP PASS
              </Badge>
            </div>
            
            <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight leading-snug break-keep">
              단 한 장의 멤버십으로<br className="hidden sm:inline" />{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5D061] via-[#E6AF2E] to-[#C28B1E]">
                원주 최고의 VIP 특권
              </span>을 누리세요
            </h2>

            <p className="text-[12px] sm:text-xs text-zinc-300 leading-relaxed break-keep">
              고유 QR 코드로 간편 출입 인증부터 투핸드 보너스 즉시 적립, 정기 토너먼트 우선 접수까지 스마트하게 지원됩니다.
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1 text-[10.5px]">
              <span className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-zinc-300">
                ⚡ QR 원터치 출입
              </span>
              <span className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-zinc-300">
                💎 실시간 핸드 적립
              </span>
              <span className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-zinc-300">
                🏆 대회 우선 배정
              </span>
            </div>
          </div>

          {/* Compact Luxury Card Visual */}
          <div className="relative w-48 sm:w-56 aspect-[16/10] shrink-0 overflow-hidden rounded-2xl border border-[#E6AF2E]/40 shadow-xl shadow-yellow-500/15 group">
            <Image
              src="/images/vip-card-3d.jpg"
              alt="FLOP VIP 3D Gold Card"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="shimmer-light" />
          </div>
        </div>

        {/* Interactive VIP Tier Switcher */}
        <div className="space-y-4 pt-4 border-t border-[#E6AF2E]/20">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#F3E5AB]">등급별 멤버십 혜택</span>
            <span className="text-[11px] text-[#9CA3AF]">탭을 눌러 혜택을 확인하세요</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {(['NORMAL', 'VIP', 'VVIP', 'ROYAL'] as const).map((tierKey) => (
              <button
                key={tierKey}
                onClick={() => setSelectedTier(tierKey)}
                className={`py-2 px-1 rounded-xl text-xs font-extrabold transition-all border ${
                  selectedTier === tierKey
                    ? 'border-[#F5D061] bg-[#F5D061]/20 text-[#F5D061] shadow-lg shadow-yellow-500/20 scale-105'
                    : 'border-white/10 bg-[#12131F] text-[#9CA3AF] hover:border-white/20'
                }`}
              >
                {tierKey}
              </button>
            ))}
          </div>

          {/* Selected Tier Perks Box */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTier}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-[#E6AF2E]/25 bg-[#0F101A] p-4 space-y-2.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className={`font-serif text-sm font-black ${tierDetails[selectedTier].textColor}`}>
                  {tierDetails[selectedTier].name}
                </span>
                <span className="text-[11px] text-[#9CA3AF]">
                  {tierDetails[selectedTier].desc}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[11.5px]">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <CheckCircle2 className="size-3.5 text-[#F5D061]" />
                  <span>{tierDetails[selectedTier].bonus}</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <CheckCircle2 className="size-3.5 text-[#F5D061]" />
                  <span>{tierDetails[selectedTier].discount}</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <CheckCircle2 className="size-3.5 text-[#F5D061]" />
                  <span>{tierDetails[selectedTier].entry}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 4. Instant Hand Bonus Payout Showcase */}
      <section className="rounded-3xl border border-[#E6AF2E]/30 bg-gradient-to-b from-[#1A1D2E] via-[#121420] to-[#0A0B10] p-5 sm:p-7 space-y-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-[#E6AF2E]/15 text-[#F5D061]">
                <Flame className="size-4 text-[#F5D061]" />
              </div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
                원터치 핸드 보너스
              </h2>
            </div>
            <p className="text-[12px] sm:text-xs text-zinc-300 break-keep leading-relaxed">
              핸드 달성 즉시 현장 딜러가 QR을 스캔하여 포인트를 즉시 적립해 드립니다.
            </p>
          </div>

          <Badge className="self-start sm:self-auto bg-gradient-to-r from-[#F5D061] to-[#C28B1E] text-black font-extrabold text-[10.5px] px-2.5 py-1 tracking-wider shadow-md">
            REALTIME PAYOUT
          </Badge>
        </div>

        {/* 2x2 Grid Layout */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Card 1: Four of a Kind */}
          <div className="rounded-2xl border border-emerald-500/30 bg-[#0E1517]/90 p-4 sm:p-5 space-y-2 text-center shadow-lg transition-all hover:border-emerald-400/50">
            <span className="inline-block text-[11px] sm:text-xs font-bold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              투핸드 포카드
            </span>
            <div className="font-extrabold text-2xl sm:text-3xl text-emerald-400 tracking-tight">
              +500 P
            </div>
            <p className="text-[11px] text-zinc-400 break-keep">
              포켓/보드 4장 완성
            </p>
          </div>

          {/* Card 2: Straight Flush */}
          <div className="rounded-2xl border border-purple-500/30 bg-[#151121]/90 p-4 sm:p-5 space-y-2 text-center shadow-lg transition-all hover:border-purple-400/50">
            <span className="inline-block text-[11px] sm:text-xs font-bold text-purple-300 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
              스트레이트 플러시
            </span>
            <div className="font-extrabold text-2xl sm:text-3xl text-purple-300 tracking-tight">
              +1,000 P
            </div>
            <p className="text-[11px] text-zinc-400 break-keep">
              동일 무늬 연속 5장
            </p>
          </div>

          {/* Card 3: Royal Flush */}
          <div className="rounded-2xl border border-[#E6AF2E]/40 bg-[#1D170A]/95 p-4 sm:p-5 space-y-2 text-center shadow-xl shadow-yellow-500/10 transition-all hover:border-[#F5D061]">
            <span className="inline-block text-[11px] sm:text-xs font-bold text-[#F5D061] px-2.5 py-0.5 rounded-full bg-[#E6AF2E]/15 border border-[#E6AF2E]/30">
              로얄 스트레이트 플러시
            </span>
            <div className="font-extrabold text-2xl sm:text-3xl text-[#F5D061] tracking-tight">
              +3,000 P
            </div>
            <p className="text-[11px] text-[#F3E5AB]/85 break-keep">
              최고 명예의 족보
            </p>
          </div>

          {/* Card 4: Special Bonus */}
          <div className="rounded-2xl border border-amber-500/30 bg-[#181926]/90 p-4 sm:p-5 space-y-2 text-center shadow-lg transition-all hover:border-amber-400/50">
            <span className="inline-block text-[11px] sm:text-xs font-bold text-amber-200 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              10장 보너스 리워드
            </span>
            <div className="font-extrabold text-2xl sm:text-3xl text-amber-200 tracking-tight">
              +5,000 P
            </div>
            <p className="text-[11px] text-zinc-400 break-keep">
              스페셜 핸드 달성자
            </p>
          </div>
        </div>
      </section>

      {/* 5. Tournament Grand Championship Showcase */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6 rounded-3xl border border-[#E6AF2E]/30 bg-gradient-to-r from-[#171A2B] via-[#10121C] to-[#0A0B10] p-5 sm:p-7">
          <div className="space-y-2.5 flex-1 text-center sm:text-left min-w-0">
            <div className="flex items-center justify-center sm:justify-start">
              <Badge className="bg-[#E6AF2E]/15 text-[#F5D061] border border-[#E6AF2E]/30 text-[10px] font-bold px-2 py-0.5 tracking-wider">
                TOURNAMENT
              </Badge>
            </div>

            <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight leading-snug break-keep">
              챔피언의 영예를 향한<br className="hidden sm:inline" />{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5D061] via-[#E6AF2E] to-[#C28B1E]">
                정기 토너먼트 챔피언십
              </span>
            </h2>

            <p className="text-[12px] sm:text-xs text-zinc-300 leading-relaxed break-keep">
              매일 열리는 데일리 토너먼트부터 주말 빅 매치까지, 클럽 랭킹 포인트와 명예의 트로피를 획득하세요.
            </p>

            <div className="pt-1.5 flex justify-center sm:justify-start">
              <Link href="/tournaments">
                <Button className="h-10 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#C28B1E] hover:from-[#F7D878] hover:to-[#D49826] text-black font-extrabold text-xs shadow-lg transition-all">
                  전체 토너먼트 일정 확인하기 <ChevronRight className="size-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative w-44 sm:w-52 aspect-[4/3] shrink-0 overflow-hidden rounded-2xl border border-[#E6AF2E]/40 shadow-xl group">
            <Image
              src="/images/trophy.jpg"
              alt="Poker Championship Trophy"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Tournament Cards List */}
        {featuredTourneys.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono font-bold text-[#9CA3AF] uppercase">
                UPCOMING TOURNAMENTS
              </span>
              <Link href="/tournaments" className="text-xs text-[#F5D061] hover:underline">
                더보기 ➔
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {featuredTourneys.map((t) => (
                <TournamentCard key={t.id} tournament={t} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 6. Royal Fair-Play Compliance (하이엔드 신뢰 & 컴플라이언스) */}
      <section className="relative overflow-hidden rounded-3xl border border-[#E6AF2E]/30 bg-gradient-to-b from-[#181A2A] via-[#10121D] to-[#0A0B12] p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Background Subtle Luxury Glow */}
        <div className="absolute -right-16 -top-16 size-64 rounded-full bg-[#E6AF2E]/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F5D061] to-[#C28B1E] text-black font-black shadow-lg shadow-yellow-500/20">
              <ShieldCheck className="size-6 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-[#E6AF2E]/15 text-[#F5D061] border border-[#E6AF2E]/30 text-[9.5px] uppercase tracking-widest font-mono font-bold">
                  COMPLIANCE & INTEGRITY
                </Badge>
              </div>
              <h3 className="text-base sm:text-xl font-extrabold text-white tracking-tight leading-snug break-keep mt-0.5">
                로열 페어플레이 & 100% 클린 스탠다드
              </h3>
            </div>
          </div>
          <span className="font-mono text-[10px] text-zinc-400 tracking-wider uppercase px-2.5 py-1 rounded-full border border-white/10 bg-white/5 shrink-0">
            LEGAL MIND SPORTS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Card 1 */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#141624] to-[#0D0E18] p-4 sm:p-5 space-y-2 hover:border-[#E6AF2E]/50 transition-all group">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-extrabold tracking-widest text-[#F5D061]">
                01 / NON-CASH ETHICS
              </span>
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-white group-hover:text-[#F3E5AB] transition-colors break-keep">
                100% 비환전 스포츠 원칙
              </h4>
              <p className="text-[11.5px] text-zinc-300 leading-relaxed break-keep">
                칩과 포인트의 현금 환전 및 P2P 장외 거래를 엄격히 금지하며, 정통 마인드 스포츠의 순수한 품격과 법적 안전성을 완벽히 보장합니다.
              </p>
            </div>
            <div className="pt-2 border-t border-white/5">
              <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400 font-bold">
                ZERO TOLERANCE POLICY
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#141624] to-[#0D0E18] p-4 sm:p-5 space-y-2 hover:border-[#E6AF2E]/50 transition-all group">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-extrabold tracking-widest text-[#F5D061]">
                02 / IMMUTABLE LEDGER
              </span>
              <span className="size-1.5 rounded-full bg-[#F5D061] animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-white group-hover:text-[#F3E5AB] transition-colors break-keep">
                불변 전산 원장 시스템
              </h4>
              <p className="text-[11.5px] text-zinc-300 leading-relaxed break-keep">
                모든 포인트의 적립과 승인, 사용 내역이 투명한 전산 원장에 실시간 동기화되어 회원의 포인트 자산을 안전하게 보호합니다.
              </p>
            </div>
            <div className="pt-2 border-t border-white/5">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#F5D061] font-bold">
                CRYPTOGRAPHIC INTEGRITY
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#141624] to-[#0D0E18] p-4 sm:p-5 space-y-2 hover:border-[#E6AF2E]/50 transition-all group">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-extrabold tracking-widest text-[#F5D061]">
                03 / TOURNAMENT INTEGRITY
              </span>
              <span className="size-1.5 rounded-full bg-indigo-400 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-white group-hover:text-[#F3E5AB] transition-colors break-keep">
                국제 표준 룰 & 페어플레이
              </h4>
              <p className="text-[11.5px] text-zinc-300 leading-relaxed break-keep">
                국제 포커 토너먼트 협회(TDA) 공인 룰과 전문 딜러진의 엄정한 진행으로 누구나 신뢰할 수 있는 공정한 경기 환경을 제공합니다.
              </p>
            </div>
            <div className="pt-2 border-t border-white/5">
              <span className="font-mono text-[9px] uppercase tracking-wider text-indigo-300 font-bold">
                OFFICIAL TDA STANDARD
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Accordion Section */}
      <section className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-extrabold text-white tracking-tight">자주 묻는 질문 (FAQ)</h2>
          <p className="text-xs text-zinc-400 break-keep">클럽 이용에 대해 궁금하신 점을 확인하세요.</p>
        </div>

        <div className="space-y-2.5 max-w-xl mx-auto">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-2xl border border-[#E6AF2E]/20 bg-[#12141F] transition-all"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="flex w-full items-center justify-between p-4 text-left text-xs sm:text-sm font-bold text-white hover:text-[#F5D061] transition-colors gap-3"
              >
                <span className="break-keep">{faq.q}</span>
                <ChevronDown
                  className={`size-4 text-[#F5D061] shrink-0 transition-transform duration-300 ${
                    activeFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="border-t border-white/5 bg-[#0C0D15] p-4 text-xs text-zinc-300 leading-relaxed break-keep">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. Location & Store Info */}
      <section className="rounded-3xl border border-[#E6AF2E]/30 bg-gradient-to-br from-[#181A28] to-[#0E1018] p-5 sm:p-7 space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#E6AF2E]/10 text-[#F5D061]">
            <MapPin className="size-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white tracking-tight">FLOP POKER CLUB 오시는 길</h3>
            <p className="text-xs text-zinc-400 break-keep">{BUSINESS_INFO.address}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <div className="rounded-2xl border border-white/10 bg-[#12141F] p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-[#F3E5AB] font-bold">
              <Clock3 className="size-4 text-[#E6AF2E] shrink-0" />
              <span>영업 시간 및 예약</span>
            </div>
            <p className="text-[12px] text-zinc-200 break-keep">
              {BUSINESS_INFO.operatingHours}
            </p>
            <p className="text-[10.5px] text-zinc-400 break-keep">{BUSINESS_INFO.contactNotice}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#12141F] p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-[#F3E5AB] font-bold">
              <ShieldCheck className="size-4 text-[#E6AF2E] shrink-0" />
              <span>편의 시설 & 주차</span>
            </div>
            <p className="text-[12px] text-zinc-200 break-keep">
              매장 인근 주변 주차 가능 · 무선 충전 테이블 · 프리미엄 음료 바
            </p>
            <p className="text-[10.5px] text-zinc-400 break-keep">흡연실 및 공기청정 시스템 가동</p>
          </div>
        </div>
      </section>

      {/* 9. Rich Footer & Business Information */}
      <footer className="border-t border-[#E6AF2E]/20 pt-8 text-center text-xs text-[#9CA3AF] space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#F5D061] to-[#C28B1E] text-black font-serif font-black text-xs">
            ♠
          </div>
          <span className="font-serif text-sm font-black text-white tracking-wider">
            {BUSINESS_INFO.brandName}
          </span>
        </div>
        <p className="text-[11.5px] leading-relaxed max-w-md mx-auto text-zinc-400 break-keep px-2">
          FLOP POKER CLUB 원주점은 건전한 마인드 스포츠 홀덤 문화를 지향하며 불법 환전 및 사행 행위를 절대 용인하지 않습니다.
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-3.5 gap-y-1 text-[11.5px] text-[#F3E5AB]">
          <Link href="/notices?tab=RULE" className="hover:underline">클럽 이용 룰북</Link>
          <span className="text-zinc-600">·</span>
          <Link href="/notices" className="hover:underline">공지사항</Link>
          <span className="text-zinc-600">·</span>
          <Link href="/tournaments" className="hover:underline">대회일정</Link>
          <span className="text-zinc-600">·</span>
          <Link href="/terms" className="hover:underline">이용약관</Link>
          <span className="text-zinc-600">·</span>
          <Link href="/privacy" className="font-semibold underline text-[#F5D061]">개인정보처리방침</Link>
        </div>

        {/* Business Registration Details */}
        <div className="rounded-2xl border border-white/5 bg-[#0C0E14]/80 p-4 max-w-md mx-auto text-[10.5px] leading-relaxed text-zinc-400 space-y-1.5 text-left break-keep">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-zinc-300">
            <span><strong>상호:</strong> {BUSINESS_INFO.companyName}</span>
            <span><strong>대표자:</strong> {BUSINESS_INFO.representative}</span>
            <span><strong>사업자등록번호:</strong> {BUSINESS_INFO.businessNumber}</span>
          </div>
          <div>
            <span><strong>사업장 소재지:</strong> {BUSINESS_INFO.address}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-zinc-300">
            <span><strong>업태:</strong> {BUSINESS_INFO.businessType}</span>
            <span><strong>종목:</strong> {BUSINESS_INFO.businessItem}</span>
            <span><strong>주류판매신고:</strong> {BUSINESS_INFO.liquorLicenseNumber}</span>
          </div>
          <div className="text-[10px] text-zinc-500 pt-0.5 border-t border-white/5">
            <span>관할 세무서: {BUSINESS_INFO.taxOffice} · 개업연월일: {BUSINESS_INFO.openingDate}</span>
          </div>
        </div>

        <p className="font-mono text-[9.5px] text-zinc-600">
          © 2026 {BUSINESS_INFO.brandName}. ALL RIGHTS RESERVED.
        </p>
      </footer>

      {/* 10. Floating Bottom Conversion Action Bar */}
      <div className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-md">
        <div className="rounded-2xl border border-[#F5D061]/50 bg-gradient-to-r from-[#212435]/95 via-[#181A26]/95 to-[#10121C]/95 p-3 shadow-2xl shadow-black/80 backdrop-blur-xl flex items-center justify-between gap-3">
          {session?.user ? (
            <>
              <div className="space-y-0.5 pl-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">{session.user.name ?? 'VIP 회원'}님</span>
                  <Badge className="bg-[#E6AF2E]/20 text-[#F5D061] text-[9px] px-1 py-0 border-[#E6AF2E]/40">
                    VIP 정회원
                  </Badge>
                </div>
                <div className="text-[10px] text-[#F3E5AB]">내 VIP 카드 & QR 코드 확인</div>
              </div>
              <Link href="/lounge">
                <Button
                  size="sm"
                  className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#F5D061] via-[#E6AF2E] to-[#C28B1E] text-black font-extrabold text-xs shadow-lg shadow-yellow-500/25 hover:scale-105 active:scale-95 transition-all"
                >
                  라운지 입장 <ArrowRight className="size-3.5 ml-1" />
                </Button>
              </Link>
            </>
          ) : (
            <>
              <div className="space-y-0.5 pl-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">가입 즉시 5,000 P</span>
                  <Badge className="bg-[#E6AF2E]/20 text-[#F5D061] text-[9px] px-1 py-0 border-[#E6AF2E]/40">
                    무료
                  </Badge>
                </div>
                <div className="text-[10px] text-[#F3E5AB]">Google 3초 간편 VIP 등록</div>
              </div>
              <Link href="/login">
                <Button
                  size="sm"
                  className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#F5D061] via-[#E6AF2E] to-[#C28B1E] text-black font-extrabold text-xs shadow-lg shadow-yellow-500/25 hover:scale-105 active:scale-95 transition-all"
                >
                  VIP 카드 발급 <ArrowRight className="size-3.5 ml-1" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
