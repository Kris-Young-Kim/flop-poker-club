'use client'

import { useState, useEffect } from 'react'
import {
  Trophy,
  Plus,
  Calendar,
  Users,
  Clock3,
  Award,
  CheckCircle2,
  AlertCircle,
  Play,
  CheckCheck,
  Ban,
  ChevronRight,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tournament, TourneyStatus } from '@/types/database.types'
import { formatPoints, formatDateTime, getTourneyStatusMeta } from '@/lib/utils/format'
import { getTournaments } from '@/lib/actions/tournaments'
import {
  createAdminTournament,
  updateAdminTournamentStatus,
  distributeAdminTournamentPrizes,
} from '@/lib/actions/admin'

const fallbackAdminTournaments: Tournament[] = [
  {
    id: 'tour-101',
    title: 'Friday Night High Roller 50K',
    description: '매주 금요일 밤 펼쳐지는 원주 최고 상금의 메인 토너먼트.',
    start_time: '2024-03-15T20:00:00.000Z',
    entry_point_cost: 50000,
    total_prize_points: 2500000,
    max_players: 30,
    current_players: 18,
    status: 'REGISTRATION',
    created_at: '2024-03-01T10:00:00.000Z',
  },
  {
    id: 'tour-103',
    title: 'Daily Evening Warm-up (LIVE)',
    description: '현재 테이블 진행 중인 데일리 워밍업 토너먼트입니다.',
    start_time: '2024-03-14T18:00:00.000Z',
    entry_point_cost: 10000,
    total_prize_points: 500000,
    max_players: 20,
    current_players: 20,
    status: 'LIVE',
    created_at: '2024-03-03T10:00:00.000Z',
  },
  {
    id: 'tour-104',
    title: 'FLOP Monthly Master Series',
    description: '월간 챔피언십! 클럽 랭커 및 트로피 보유자 초청전.',
    start_time: '2024-03-30T17:00:00.000Z',
    entry_point_cost: 100000,
    total_prize_points: 6000000,
    max_players: 40,
    current_players: 4,
    status: 'UPCOMING',
    created_at: '2024-03-04T10:00:00.000Z',
  },
]

export default function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>(fallbackAdminTournaments)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [rankModalOpen, setRankModalOpen] = useState(false)
  const [selectedTourney, setSelectedTourney] = useState<Tournament | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Create Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [entryCost, setEntryCost] = useState('50,000')
  const [prizePoints, setPrizePoints] = useState('2,500,000')
  const [maxPlayers, setMaxPlayers] = useState('30')

  // Rank Results State (Top 3)
  const [rank1User, setRank1User] = useState('김민준 (AceKing)')
  const [rank1Prize, setRank1Prize] = useState('1,250,000')
  const [rank2User, setRank2User] = useState('이서윤 (QueenSpade)')
  const [rank2Prize, setRank2Prize] = useState('750,000')
  const [rank3User, setRank3User] = useState('박준혁 (MonsterPot)')
  const [rank3Prize, setRank3Prize] = useState('500,000')

  const fetchTournaments = async () => {
    setIsLoading(true)
    try {
      const data = await getTournaments()
      if (data && data.length > 0) {
        setTournaments(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTournaments()
  }, [])

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const costNum = parseInt(entryCost.replace(/[^0-9]/g, ''), 10) || 0
    const prizeNum = parseInt(prizePoints.replace(/[^0-9]/g, ''), 10) || 0
    const maxNum = parseInt(maxPlayers, 10) || 30
    const isoStart = startTime ? new Date(startTime).toISOString() : new Date().toISOString()

    try {
      const res = await createAdminTournament({
        title,
        description,
        startTime: isoStart,
        entryPointCost: costNum,
        totalPrizePoints: prizeNum,
        maxPlayers: maxNum,
      })

      if (!res.success) {
        alert(res.error || '생성에 실패했습니다.')
        return
      }

      await fetchTournaments()
      setCreateModalOpen(false)
      setTitle('')
      setDescription('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      alert(msg || '오류가 발생했습니다.')
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: TourneyStatus) => {
    try {
      const res = await updateAdminTournamentStatus({ tournamentId: id, status: newStatus })
      if (!res.success) {
        alert(res.error || '상태 변경에 실패했습니다.')
        return
      }
      setTournaments((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      alert(msg || '오류가 발생했습니다.')
    }
  }

  const handleOpenRankModal = (tourney: Tournament) => {
    setSelectedTourney(tourney)
    setRankModalOpen(true)
  }

  const handleConfirmRanks = async () => {
    if (selectedTourney) {
      await handleUpdateStatus(selectedTourney.id, 'COMPLETED')
      setRankModalOpen(false)
      alert(`${selectedTourney.title} 대회 결과 및 상금 포인트가 확정되었습니다.`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-[#E6AF2E]" />
            <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
              토너먼트 대회 생성 및 관리
            </h1>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            정기 토너먼트 일정을 개설하고 참가자 상태 및 최종 순위/상금을 확정합니다.
          </p>
        </div>

        <Button
          onClick={() => setCreateModalOpen(true)}
          className="h-11 px-5 rounded-2xl bg-gradient-to-r from-[#F5D061] via-[#E6AF2E] to-[#C28B1E] text-black font-bold text-xs shadow-lg shadow-yellow-500/25"
        >
          <Plus className="size-4 mr-1.5" />
          새 토너먼트 생성
        </Button>
      </div>

      {/* Tournament List */}
      <div className="space-y-4">
        {tournaments.map((tourney) => {
          const statusMeta = getTourneyStatusMeta(tourney.status)
          return (
            <Card
              key={tourney.id}
              className="rounded-3xl border border-[#E6AF2E]/25 bg-gradient-to-br from-[#181A26] to-[#12131A] p-5 shadow-xl"
            >
              <CardContent className="p-0 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                {/* Tournament Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${statusMeta.bgClass} ${statusMeta.colorClass} border text-xs font-bold px-2.5 py-0.5`}>
                      {statusMeta.label}
                    </Badge>
                    <span className="text-xs text-[#9CA3AF] flex items-center gap-1">
                      <Calendar className="size-3.5 text-[#E6AF2E]" />
                      시작: {formatDateTime(tourney.start_time, 'full')}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-white">
                    {tourney.title}
                  </h3>
                  {tourney.description && (
                    <p className="text-xs text-[#9CA3AF]">{tourney.description}</p>
                  )}

                  {/* Metrics */}
                  <div className="flex items-center gap-4 text-xs font-mono pt-1">
                    <span className="text-[#F5D061] font-bold">
                      상금풀: {formatPoints(tourney.total_prize_points)}
                    </span>
                    <span className="text-[#9CA3AF]">|</span>
                    <span className="text-white">
                      참가비: {tourney.entry_point_cost > 0 ? formatPoints(tourney.entry_point_cost) : '무료'}
                    </span>
                    <span className="text-[#9CA3AF]">|</span>
                    <span className="text-[#F3E5AB]">
                      참가 인원: {tourney.current_players || 0} / {tourney.max_players}명
                    </span>
                  </div>
                </div>

                {/* Status Switcher & Rank Action */}
                <div className="flex flex-wrap items-center gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#E6AF2E]/15 shrink-0">
                  {tourney.status === 'UPCOMING' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(tourney.id, 'REGISTRATION')}
                      className="h-9 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400"
                    >
                      접수 시작하기
                    </Button>
                  )}

                  {tourney.status === 'REGISTRATION' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(tourney.id, 'LIVE')}
                      className="h-9 rounded-xl bg-red-500 text-white font-bold text-xs hover:bg-red-400"
                    >
                      <Play className="size-3 mr-1 fill-white" />
                      경기 시작 (LIVE)
                    </Button>
                  )}

                  {tourney.status === 'LIVE' && (
                    <Button
                      size="sm"
                      onClick={() => handleOpenRankModal(tourney)}
                      className="h-9 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#E6AF2E] text-black font-bold text-xs shadow-md"
                    >
                      <Award className="size-3.5 mr-1" />
                      최종 순위 & 상금 확정
                    </Button>
                  )}

                  {tourney.status === 'COMPLETED' && (
                    <Badge className="bg-muted text-muted-foreground text-xs py-1.5 px-3">
                      대회 종료 및 상금 완료
                    </Badge>
                  )}

                  {tourney.status !== 'COMPLETED' && tourney.status !== 'CANCELLED' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUpdateStatus(tourney.id, 'CANCELLED')}
                      className="h-9 text-xs text-rose-400 hover:bg-rose-500/10"
                    >
                      대회 취소
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Create Tournament Dialog */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-md border-[#E6AF2E]/30 bg-[#13141C] text-white p-6 rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="size-5 text-[#E6AF2E]" />
              신규 토너먼트 개설
            </DialogTitle>
            <DialogDescription className="text-xs text-[#9CA3AF]">
              대회 명칭, 상금풀, 참가비 및 일정을 입력하세요.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTournament} className="space-y-3.5 my-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#F3E5AB]">대회 명칭</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: Saturday Weekend Deepstack 30K"
                className="h-10 rounded-xl border-[#E6AF2E]/30 bg-[#181A26] text-xs text-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#F3E5AB]">상세 설명</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="예: 스타팅 칩 30,000 / 15분 블라인드"
                className="h-10 rounded-xl border-[#E6AF2E]/30 bg-[#181A26] text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#F3E5AB]">총 상금풀 (P)</label>
                <Input
                  value={prizePoints}
                  onChange={(e) => setPrizePoints(e.target.value)}
                  placeholder="2,500,000"
                  className="h-10 rounded-xl border-[#E6AF2E]/30 bg-[#181A26] text-xs text-white font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#F3E5AB]">참가비 (P)</label>
                <Input
                  value={entryCost}
                  onChange={(e) => setEntryCost(e.target.value)}
                  placeholder="50,000"
                  className="h-10 rounded-xl border-[#E6AF2E]/30 bg-[#181A26] text-xs text-white font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#F3E5AB]">최대 정원</label>
                <Input
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(e.target.value)}
                  type="number"
                  placeholder="30"
                  className="h-10 rounded-xl border-[#E6AF2E]/30 bg-[#181A26] text-xs text-white font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#F3E5AB]">시작 일시</label>
                <Input
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  type="datetime-local"
                  className="h-10 rounded-xl border-[#E6AF2E]/30 bg-[#181A26] text-xs text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                className="flex-1 border-[#E6AF2E]/30 bg-transparent text-white text-xs"
              >
                취소
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-[#F5D061] via-[#E6AF2E] to-[#C28B1E] text-black font-bold text-xs"
              >
                토너먼트 개설
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rank Results & Prize Awarding Dialog */}
      <Dialog open={rankModalOpen} onOpenChange={setRankModalOpen}>
        <DialogContent className="max-w-md border-[#E6AF2E]/40 bg-[#13141C] text-white p-6 rounded-3xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="size-5 text-[#F5D061]" />
              최종 순위 및 상금 포인트 지급
            </DialogTitle>
            <DialogDescription className="text-xs text-[#9CA3AF]">
              {selectedTourney?.title} 대회의 최종 입상자에게 포인트를 자동 지급합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs">
            {/* 1st Place */}
            <div className="rounded-2xl border border-yellow-500/30 bg-[#1C1810] p-3.5 space-y-1.5">
              <div className="flex justify-between items-center font-bold text-yellow-300">
                <span>🥇 1위 (우승)</span>
                <span className="font-mono">{rank1Prize} P</span>
              </div>
              <Input
                value={rank1User}
                onChange={(e) => setRank1User(e.target.value)}
                className="h-8 text-xs bg-[#13141C] border-[#E6AF2E]/30 text-white"
              />
            </div>

            {/* 2nd Place */}
            <div className="rounded-2xl border border-slate-400/30 bg-[#14151E] p-3.5 space-y-1.5">
              <div className="flex justify-between items-center font-bold text-slate-300">
                <span>🥈 2위 (준우승)</span>
                <span className="font-mono">{rank2Prize} P</span>
              </div>
              <Input
                value={rank2User}
                onChange={(e) => setRank2User(e.target.value)}
                className="h-8 text-xs bg-[#13141C] border-[#E6AF2E]/30 text-white"
              />
            </div>

            {/* 3rd Place */}
            <div className="rounded-2xl border border-amber-700/30 bg-[#1A1412] p-3.5 space-y-1.5">
              <div className="flex justify-between items-center font-bold text-amber-500">
                <span>🥉 3위</span>
                <span className="font-mono">{rank3Prize} P</span>
              </div>
              <Input
                value={rank3User}
                onChange={(e) => setRank3User(e.target.value)}
                className="h-8 text-xs bg-[#13141C] border-[#E6AF2E]/30 text-white"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setRankModalOpen(false)}
              className="flex-1 border-[#E6AF2E]/30 bg-transparent text-white"
            >
              취소
            </Button>
            <Button
              onClick={handleConfirmRanks}
              className="flex-1 bg-gradient-to-r from-[#F5D061] via-[#E6AF2E] to-[#C28B1E] text-black font-bold"
            >
              상금 자동 분배 및 종료
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
