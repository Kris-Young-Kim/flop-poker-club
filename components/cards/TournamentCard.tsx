'use client'

import { useState } from 'react'
import { Trophy, Users, Clock3, Calendar, ChevronRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tournament } from '@/types/database.types'
import { formatPoints, formatDateTime, getTourneyStatusMeta } from '@/lib/utils/format'

interface TournamentCardProps {
  tournament: Tournament
  isRegistered?: boolean
  onRegister?: (tournamentId: string) => void
  onCancelRegister?: (tournamentId: string) => void
}

export function TournamentCard({
  tournament,
  isRegistered = false,
  onRegister,
  onCancelRegister,
}: TournamentCardProps) {
  const [registeredState, setRegisteredState] = useState(isRegistered)
  const [loading, setLoading] = useState(false)

  const statusMeta = getTourneyStatusMeta(tournament.status)
  const currentCount = tournament.current_players ?? 14
  const maxCount = tournament.max_players || 30
  const progressPercent = Math.min(100, Math.round((currentCount / maxCount) * 100))

  const handleAction = () => {
    setLoading(true)
    setTimeout(() => {
      if (registeredState) {
        setRegisteredState(false)
        onCancelRegister?.(tournament.id)
      } else {
        setRegisteredState(true)
        onRegister?.(tournament.id)
      }
      setLoading(false)
    }, 400)
  }

  const isLive = tournament.status === 'LIVE'
  const isRegistration = tournament.status === 'REGISTRATION'
  const isUpcoming = tournament.status === 'UPCOMING'
  const isCompleted = tournament.status === 'COMPLETED'

  return (
    <Card className="relative overflow-hidden border border-[#E6AF2E]/25 bg-gradient-to-br from-[#181A26] to-[#12131A] shadow-xl hover:border-[#E6AF2E]/50 transition-all rounded-2xl group">
      {/* Live / Highlight Glow Ribbon */}
      {isLive && (
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-red-500 via-amber-400 to-red-500 animate-pulse" />
      )}

      <CardContent className="p-5 sm:p-6 flex flex-col justify-between min-h-[210px]">
        {/* Top: Status & Date */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`${statusMeta.bgClass} ${statusMeta.colorClass} border text-[11px] font-bold px-2.5 py-0.5 rounded-full`}>
              {isLive && <span className="mr-1.5 inline-block size-1.5 rounded-full bg-red-400 animate-ping" />}
              {statusMeta.label}
            </Badge>

            {registeredState && (
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="size-3" /> 내 참가 등록됨
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
            <Calendar className="size-3.5 text-[#E6AF2E]" />
            <span>{formatDateTime(tournament.start_time, 'short')}</span>
          </div>
        </div>

        {/* Middle: Title & Prizes */}
        <div className="my-3">
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight group-hover:text-[#F3E5AB] transition-colors flex items-center gap-2">
            {tournament.title}
          </h3>
          {tournament.description && (
            <p className="text-xs text-[#9CA3AF] line-clamp-1 mt-1">
              {tournament.description}
            </p>
          )}

          {/* Key Metrics Grid */}
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[#0F1017]/80 p-3 border border-[#E6AF2E]/15">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">총 상금풀 (PRIZE POOL)</p>
              <p className="text-sm sm:text-base font-bold text-[#F5D061] flex items-center gap-1 mt-0.5">
                <Trophy className="size-4 text-[#E6AF2E]" />
                {formatPoints(tournament.total_prize_points)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">참가비 (ENTRY POINT)</p>
              <p className="text-sm sm:text-base font-bold text-white mt-0.5">
                {tournament.entry_point_cost > 0 ? formatPoints(tournament.entry_point_cost) : '무료 참가'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom: Players Progress & Action */}
        <div className="pt-2 border-t border-[#E6AF2E]/15 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Players count */}
          <div className="flex-1 pr-2">
            <div className="flex items-center justify-between text-xs text-[#9CA3AF] mb-1.5">
              <span className="flex items-center gap-1 text-[11px]">
                <Users className="size-3.5 text-[#E6AF2E]" />
                참가 인원
              </span>
              <span className="font-mono text-xs font-medium text-white">
                <strong className="text-[#F5D061]">{currentCount}</strong> / {maxCount}명
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1F2233]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#F5D061] to-[#E6AF2E] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="shrink-0">
            {isRegistration ? (
              <Button
                size="sm"
                onClick={handleAction}
                disabled={loading}
                className={`w-full sm:w-auto h-9 px-4 rounded-xl text-xs font-bold transition-all ${
                  registeredState
                    ? 'border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20'
                    : 'bg-gradient-to-r from-[#F5D061] via-[#E6AF2E] to-[#C28B1E] text-black hover:opacity-95 shadow-md shadow-yellow-500/20'
                }`}
              >
                {registeredState ? '참가 취소' : '참가 신청하기'}
              </Button>
            ) : isLive ? (
              <Button
                size="sm"
                variant="outline"
                className="w-full sm:w-auto h-9 px-4 rounded-xl text-xs font-bold border-red-500/40 text-red-400 bg-red-500/10 cursor-default"
              >
                대회 진행중
              </Button>
            ) : isCompleted ? (
              <Button
                size="sm"
                variant="outline"
                className="w-full sm:w-auto h-9 px-4 rounded-xl text-xs font-medium border-border text-[#9CA3AF] bg-transparent cursor-default"
              >
                대회 종료
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="w-full sm:w-auto h-9 px-4 rounded-xl text-xs font-bold border-[#E6AF2E]/40 text-[#F3E5AB] hover:bg-[#E6AF2E]/10"
              >
                오픈 알림
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
