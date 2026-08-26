'use client'

import { useState, useEffect } from 'react'
import { Trophy, Sparkles, Clock3 } from 'lucide-react'
import { TournamentCard } from '@/components/cards/TournamentCard'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Tournament } from '@/types/database.types'
import { getTournaments, getMyRegistrations, registerForTournament, cancelRegistration } from '@/lib/actions/tournaments'
import { toast } from 'sonner'

export default function TournamentsPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'MY_REG' | 'LIVE'>('ALL')
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getTournaments(), getMyRegistrations()]).then(([ts, regs]) => {
      setTournaments(ts)
      setRegisteredIds(new Set(regs.map((r) => r.tournament_id)))
      setLoading(false)
    })
  }, [])

  const handleRegister = async (id: string) => {
    const result = await registerForTournament(id)
    if (result.success) {
      toast.success('토너먼트 신청이 완료되었습니다.')
      setRegisteredIds((prev) => new Set([...prev, id]))
      getTournaments().then(setTournaments)
    } else {
      toast.error(result.error ?? '신청에 실패했습니다.')
    }
  }

  const handleCancelRegister = async (id: string) => {
    const result = await cancelRegistration(id)
    if (result.success) {
      toast.success('신청이 취소되었습니다. 포인트가 환불됩니다.')
      setRegisteredIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      getTournaments().then(setTournaments)
    } else {
      toast.error(result.error ?? '취소에 실패했습니다.')
    }
  }

  const registeredTournaments = tournaments.filter((t) => registeredIds.has(t.id))
  const liveTournaments = tournaments.filter((t) => t.status === 'LIVE')
  const totalPrizeSum = tournaments
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

      {/* Prize Pool Banner */}
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'ALL' | 'MY_REG' | 'LIVE')} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#13141C] border border-[#E6AF2E]/20 p-1 rounded-2xl h-11">
          <TabsTrigger
            value="ALL"
            className="rounded-xl text-xs font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#F5D061] data-[state=active]:to-[#E6AF2E] data-[state=active]:text-black"
          >
            전체 ({tournaments.length})
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

        <TabsContent value="ALL" className="mt-4 space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-[#E6AF2E]/20 bg-[#13141C]/50 p-8 text-center text-sm text-[#9CA3AF]">
              불러오는 중...
            </div>
          ) : tournaments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E6AF2E]/20 bg-[#13141C]/50 p-8 text-center">
              <Trophy className="mx-auto size-10 text-[#9CA3AF]/40" />
              <p className="mt-2 text-sm font-semibold text-white">예정된 대회가 없습니다.</p>
            </div>
          ) : (
            tournaments.map((tourney) => (
              <TournamentCard
                key={tourney.id}
                tournament={tourney}
                isRegistered={registeredIds.has(tourney.id)}
                onRegister={handleRegister}
                onCancelRegister={handleCancelRegister}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="MY_REG" className="mt-4 space-y-4">
          {registeredTournaments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E6AF2E]/20 bg-[#13141C]/50 p-8 text-center">
              <Trophy className="mx-auto size-10 text-[#9CA3AF]/40" />
              <p className="mt-2 text-sm font-semibold text-white">현재 신청한 토너먼트가 없습니다.</p>
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

        <TabsContent value="LIVE" className="mt-4 space-y-4">
          {liveTournaments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E6AF2E]/20 bg-[#13141C]/50 p-8 text-center">
              <Clock3 className="mx-auto size-10 text-[#9CA3AF]/40" />
              <p className="mt-2 text-sm font-semibold text-white">현재 진행 중인 실시간 대회가 없습니다.</p>
            </div>
          ) : (
            liveTournaments.map((tourney) => (
              <TournamentCard
                key={tourney.id}
                tournament={tourney}
                isRegistered={registeredIds.has(tourney.id)}
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
