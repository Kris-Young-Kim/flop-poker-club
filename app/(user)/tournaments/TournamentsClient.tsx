'use client'

import { useState } from 'react'
import { Trophy, Sparkles, Clock3 } from 'lucide-react'
import { TournamentCard } from '@/components/cards/TournamentCard'
import { TournamentPrizeBoard } from '@/components/cards/TournamentPrizeBoard'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Tournament } from '@/types/database.types'
import { getTournaments, registerForTournament, cancelRegistration } from '@/lib/actions/tournaments'
import { toast } from 'sonner'

interface Props {
  initialTournaments: Tournament[]
  initialRegisteredIds: string[]
}

export function TournamentsClient({ initialTournaments, initialRegisteredIds }: Props) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'MY_REG' | 'LIVE'>('ALL')
  const [tournaments, setTournaments] = useState<Tournament[]>(initialTournaments)
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set(initialRegisteredIds))

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
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-[#E6AF2E]" />
            <h1 className="font-serif text-xl font-bold tracking-tight text-white">
              토너먼트 대회 & 시상 안내
            </h1>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            FLOP Poker Club의 정기 대회 일정 및 접수 현황입니다.
          </p>
        </div>
      </div>

      {/* Official Prize Board */}
      <TournamentPrizeBoard />

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
          {tournaments.length === 0 ? (
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
