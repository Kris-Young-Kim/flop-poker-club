'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Megaphone,
  Sparkles,
  BookOpen,
  Search,
  Pin,
  HelpCircle,
  ShieldCheck,
  Check
} from 'lucide-react'
import { NoticeCard } from '@/components/cards/NoticeCard'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { NoticeEvent, NoticeCategory } from '@/types/database.types'

const mockNotices: NoticeEvent[] = [
  {
    id: 'not-101',
    category: 'NOTICE',
    title: '♠ FLOP POKER CLUB 원주점 회원가입 및 멤버십 혜택 총정리',
    content: `FLOP POKER CLUB 원주점에 오신 회원 여러분을 진심으로 환영합니다.

[회원 전용 상시 혜택]
1. 투핸드 포카드 달성 시: +500 P 즉시 지급
2. 스트레이트 플러시 달성 시: +1,000 P 즉시 지급
3. 로열 스트레이트 플러시 달성 시: +3,000 P 즉시 지급
4. 매주 금요일 밤 High Roller 토너먼트 진행

매장 입장 및 핸드 승리 시 [내 QR 코드]를 직원에게 제시해주시면 1초 내로 원장에 안전하게 기록됩니다.`,
    is_pinned: true,
    author_id: 'admin-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'not-102',
    category: 'EVENT',
    title: '🔥 신규 멤버십 오픈 기념 웰컴 5,000 P 지급 이벤트',
    content: `FLOP 클럽 앱 온보딩을 완료하신 모든 신규 회원님께 즉시 사용 가능한 웰컴 5,000 포인트를 증정합니다.

• 대상: 구글 간편인증 및 온보딩 완료 회원
• 기간: 상시 진행
• 지급 방식: 가입 즉시 회원 원장 계좌로 자동 충전

지급된 포인트는 토너먼트 참가 신청 및 클럽 라운지 이용 시 자유롭게 사용하실 수 있습니다.`,
    is_pinned: false,
    author_id: 'admin-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    id: 'not-103',
    category: 'RULE',
    title: '📜 FLOP POKER CLUB 공식 경기 룰 & 에티켓 가이드',
    content: `저희 FLOP POKER CLUB은 TDA(Tournament Directors Association) 국제 토너먼트 공식 룰을 엄격히 준수합니다.

[핵심 경기 룰 요약]
1. One Player to a Hand: 핸드 진행 중 타인과의 조언 및 카드 공개 금지
2. Two-Hand Showdown: 쇼다운 시 반드시 본인의 두 장의 핸드를 모두 오픈해야 합니다.
3. String Bet 금지: 칩을 베팅 라인 너머로 밀어 넣을 때는 단 한 번의 동작으로 밀거나, 동작 전 구두로 정확한 액수를 선언해야 합니다.
4. 매장 내 바인권은 종이 티켓 실물로만 유통되며 어플리케이션 내 디지털 거래는 지원하지 않습니다.

클럽 내 매너를 지켜 건전하고 품격 있는 홀덤 문화를 함께 만들어 주세요.`,
    is_pinned: true,
    author_id: 'admin-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: 'not-104',
    category: 'EVENT',
    title: '🏆 3월 토너먼트 최다 파이널 진출 랭커 리워드',
    content: `3월 한 달간 정기 토너먼트 Final Table(Top 9)에 가장 많이 진출하신 회원 3분을 선정하여 총 100,000 P 특별 보너스를 지급합니다.

1위: 50,000 P + 월간 마스터즈 프리패스
2위: 30,000 P
3위: 20,000 P

원장 페이지와 토너먼트 탭에서 실시간 랭킹과 경기 일정을 확인하세요.`,
    is_pinned: false,
    author_id: 'admin-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
  },
  {
    id: 'not-105',
    category: 'RULE',
    title: '🔒 포인트 원장 무결성 및 보안 운영 수칙',
    content: `FLOP POKER CLUB의 모든 포인트 변동은 데이터베이스 수준에서 비관적 동시성 락(Pessimistic Locking)과 불변 원장(Immutable Ledger) 시스템으로 철저히 보호됩니다.

• 포인트는 유저 간 송금/이체 및 현금 환급이 법적으로 엄격히 제한됩니다.
• 오직 인증된 스태프의 카메라 QR 스캔 트랜잭션을 통해서만 안전하게 지급/차감됩니다.`,
    is_pinned: false,
    author_id: 'admin-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 140).toISOString(),
  },
]

function NoticesContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')

  const [activeCategory, setActiveCategory] = useState<string>(
    tabParam === 'RULE' || tabParam === 'EVENT' || tabParam === 'NOTICE'
      ? tabParam
      : 'ALL'
  )
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (tabParam && ['RULE', 'EVENT', 'NOTICE', 'ALL'].includes(tabParam)) {
      setActiveCategory(tabParam)
    }
  }, [tabParam])

  const filteredNotices = useMemo(() => {
    return mockNotices.filter((n) => {
      // Category filter
      if (activeCategory !== 'ALL' && n.category !== activeCategory) {
        return false
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = n.title.toLowerCase().includes(q)
        const matchContent = n.content.toLowerCase().includes(q)
        if (!matchTitle && !matchContent) return false
      }

      return true
    })
  }, [activeCategory, searchQuery])

  // Split into pinned and regular
  const pinnedNotices = filteredNotices.filter((n) => n.is_pinned)
  const regularNotices = filteredNotices.filter((n) => !n.is_pinned)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="size-5 text-[#E6AF2E]" />
            <h1 className="font-serif text-xl font-bold tracking-tight text-white">
              공지 및 클럽 가이드
            </h1>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            FLOP Poker Club의 최신 공지사항, 프로모션, 공식 룰북입니다.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs
        value={activeCategory}
        onValueChange={setActiveCategory}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 bg-[#13141C] border border-[#E6AF2E]/20 p-1 rounded-2xl h-11">
          <TabsTrigger
            value="ALL"
            className="rounded-xl text-xs font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#F5D061] data-[state=active]:to-[#E6AF2E] data-[state=active]:text-black"
          >
            전체
          </TabsTrigger>
          <TabsTrigger
            value="NOTICE"
            className="rounded-xl text-xs font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#F5D061] data-[state=active]:to-[#E6AF2E] data-[state=active]:text-black"
          >
            공지
          </TabsTrigger>
          <TabsTrigger
            value="EVENT"
            className="rounded-xl text-xs font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#F5D061] data-[state=active]:to-[#E6AF2E] data-[state=active]:text-black"
          >
            이벤트
          </TabsTrigger>
          <TabsTrigger
            value="RULE"
            className="rounded-xl text-xs font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#F5D061] data-[state=active]:to-[#E6AF2E] data-[state=active]:text-black"
          >
            룰북
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 size-4 text-[#9CA3AF]" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="공지, 이벤트, 룰북 내용 검색..."
          className="border-[#E6AF2E]/20 bg-[#13141C] pl-10 text-xs h-10 text-white placeholder:text-[#9CA3AF] rounded-xl focus-visible:border-[#E6AF2E]"
        />
      </div>

      {/* Notice List */}
      <div className="space-y-3.5">
        {/* Pinned notices first */}
        {pinnedNotices.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs text-[#F5D061] font-bold px-1">
              <Pin className="size-3.5 fill-[#F5D061]" />
              <span>필독 공지사항</span>
            </div>
            {pinnedNotices.map((notice) => (
              <NoticeCard key={notice.id} notice={notice} />
            ))}
          </div>
        )}

        {/* Regular notices */}
        {regularNotices.length > 0 && (
          <div className="space-y-3">
            {pinnedNotices.length > 0 && (
              <div className="text-xs text-[#9CA3AF] font-bold px-1 pt-2">
                일반 게시글
              </div>
            )}
            {regularNotices.map((notice) => (
              <NoticeCard key={notice.id} notice={notice} />
            ))}
          </div>
        )}

        {filteredNotices.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#E6AF2E]/20 bg-[#13141C]/50 p-8 text-center">
            <Megaphone className="mx-auto size-10 text-[#9CA3AF]/40" />
            <p className="mt-2 text-sm font-semibold text-white">
              검색 조건과 일치하는 공지사항이 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function NoticesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#9CA3AF]">소식을 불러오는 중...</div>}>
      <NoticesContent />
    </Suspense>
  )
}
