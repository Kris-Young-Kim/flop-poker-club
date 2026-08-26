'use client'

import { useState } from 'react'
import { Trophy, Calendar, Filter, Sparkles, AlertCircle, CheckCircle2, Clock3 } from 'lucide-react'
import { TournamentCard } from '@/components/cards/TournamentCard'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tournament, TournamentParticipant } from '@/types/database.types'
import { formatPoints, formatDateTime } from '@/lib/utils/format'

const mockTournaments: Tournament[] = [
  {
    id: 'tour-101',
    title: 'Friday Night High Roller 50K',
    description: '매주 금요일 밤 펼쳐지는 원주 최고 상금의 메인 토너먼트. 30,000 스타팅 칩 / 15분 블라인드.',
    start_time: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
    entry_point_cost: 50000,
    total_prize_points: 2500000,
    max_players: 30,
    current_players: 18,
    status: 'REGISTRATION',
    created_at: new Date().toISOString(),
  },
  {
    id: 'tour-102',
    title: 'Saturday Weekend Turbo Deepstack',
    description: '스피디하고 짜릿한 블라인드 업! 주말 터보 딥스택 이벤트.',
    start_time: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(),
    entry_point_cost: 30000,
    total_prize_points: 1200000,
    max_players: 24,
    current_players: 9,
    status: 'REGISTRATION',
    created_at: new Date().toISOString(),
  },
  {
    id: 'tour-103',
    title: 'Daily Evening Warm-up (LIVE)',
    description: '현재 테이블 진행 중인 데일리 워밍업 토너먼트입니다.',
    start_time: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    entry_point_cost: 10000,
    total_prize_points: 500000,
    max_players: 20,
    current_players: 20,
    status: 'LIVE',
    created_at: new Date().toISOString(),
  },
  {
    id: 'tour-104',
    title: 'FLOP Monthly Master Series',
    description: '월간 챔피언십! 클럽 랭커 및 트로피 보유자 초청전.',
    start_time: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    entry_point_cost: 100000,
    total_prize_points: 6000000,
    max_players: 40,
    current_players: 4,
    status: 'UPCOMING',
    created_at: new Date().toISOString(),
  },
  {
    id: 'tour-105',
    title: 'Thursday Mid-Week Showdown',
    description: '어제 진행된 목요 쇼다운 토너먼트입니다.',
    start_time: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    entry_point_cost: 20000,
    total_prize_points: 800000,
    max_players: 20,
    current_players: 20,
    status: 'COMPLETED',
    created_at: new Date().toISOString(),
  },
]

export default function TournamentsPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'MY_REG' | 'LIVE'>('ALL')
  const [registeredIds, setRegisteredIds] = useState<string[]>(['tour-101'])

  const handleRegister = (id: string) => {
    if (!registeredIds.includes(id)) {
      setRegisteredIds((prev) => [...prev, id])
    }
  }

  const handleCancelRegister = (id: string) => {
    setRegisteredIds((prev) => prev.filter((i) => i !== id))
  }

  const registeredTournaments = mockTournaments.filter((t) =>
    registeredIds.includes(t.id)
  )

  const liveTournaments = mockTournaments.filter((t) => t.status === 'LIVE')

  const totalPrizeSum = mockTournaments
    .filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED')
    .reduce((acc, cur) => acc + cur.total_prize_points, 0)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-[#E6AF2E]" />
            <h1 className="font-serif text-xl font-bold tracking-tight text-white">
              토너먼트 대회
            </h1>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            FLOP Poker Club의 정기 대회 일정 및 접수 현황입니다.
          </p>
        </div>
      </div>

      {/* Prize Pool Highlights Banner */}
      <div className="rounded-3xl border border-[#E6AF2E]/30 bg-gradient-to-br from-[#231808] via-[#161622] to-[#0E0F16] p-5 shadow-2xl shadow-yellow-500/5 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-[#F5D061]">
            <Sparkles className="size-3.5 text-[#F5D061]" />
            진행 예정 보장 상금풀
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-black text-white drop-shadow-[0_2px_10px_rgba(245,208,97,0.3)]">
              {new Intl.NumberFormat('ko-KR').format(totalPrizeSum)}
            </span>
            <span className="font-serif text-lg font-bold text-[#F5D061]">P</span>
          </div>
          <p className="text-[11px] text-[#9CA3AF] mt-1">
            원주점 테이블 참가 접수는 선착순으로 마감됩니다.
          </p>
        </div>

        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F5D061] to-[#C28B1E] text-black shadow-lg shadow-yellow-500/25 font-serif text-2xl font-black">
          ♠
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as any)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 bg-[#13141C] border border-[#E6AF2E]/20 p-1 rounded-2xl h-11">
          <TabsTrigger
            value="ALL"
            className="rounded-xl text-xs font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#F5D061] data-[state=active]:to-[#E6AF2E] data-[state=active]:text-black"
          >
            전체 대회 ({mockTournaments.length})
          </TabsTrigger>
          <TabsTrigger
            value="MY_REG"
            className="rounded-xl text-xs font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#F5D061] data-[state=active]:to-[#E6AF2E] data-[state=active]:text-black"
          >
            내 신청 ({registeredTournaments.length})
          </TabsTrigger>
          <TabsTrigger
            value="LIVE"
            className="rounded-xl text-xs font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#F5D061] data-[state=active]:to-[#E6AF2E] data-[state=active]:text-black"
          >
            진행중 ({liveTournaments.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: All Tournaments */}
        <TabsContent value="ALL" className="mt-4 space-y-4">
          {mockTournaments.map((tourney) => (
            <TournamentCard
              key={tourney.id}
              tournament={tourney}
              isRegistered={registeredIds.includes(tourney.id)}
              onRegister={handleRegister}
              onCancelRegister={handleCancelRegister}
            />
          ))}
        </TabsContent>

        {/* Tab 2: My Applications */}
        <TabsContent value="MY_REG" className="mt-4 space-y-4">
          {registeredTournaments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E6AF2E]/20 bg-[#13141C]/50 p-8 text-center">
              <Trophy className="mx-auto size-10 text-[#9CA3AF]/40" />
              <p className="mt-2 text-sm font-semibold text-white">
                현재 신청한 토너먼트가 없습니다.
              </p>
              <p className="text-xs text-[#9CA3AF] mt-1">
                상단의 전체 대회 탭에서 참가하고 싶은 토너먼트를 신청해 보세요!
              </p>
              <Button
                onClick={() => setActiveTab('ALL')}
                className="mt-4 bg-[#E6AF2E] text-black font-bold text-xs"
              >
                대회 목록 보러가기
              </Button>
            </div>
          ) : (
            registeredTournaments.map((tourney) => (
              <TournamentCard
                key={tourney.id}
                tournament={tourney}
                isRegistered={true}
                onRegister={handleRegister}
                onCancelRegister={handleCancelRegister}
              />
            ))
          )}
        </TabsContent>

        {/* Tab 3: Live Tournaments */}
        <TabsContent value="LIVE" className="mt-4 space-y-4">
          {liveTournaments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E6AF2E]/20 bg-[#13141C]/50 p-8 text-center">
              <Clock3 className="mx-auto size-10 text-[#9CA3AF]/40" />
              <p className="mt-2 text-sm font-semibold text-white">
                현재 진행 중인 실시간 대회가 없습니다.
              </p>
            </div>
          ) : (
            liveTournaments.map((tourney) => (
              <TournamentCard
                key={tourney.id}
                tournament={tourney}
                isRegistered={registeredIds.includes(tourney.id)}
                onRegister={handleRegister}
                onCancelRegister={handleCancelRegister}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
