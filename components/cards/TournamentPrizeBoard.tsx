'use client'

import { Trophy, Gift, Plane, Hotel, CreditCard, Ticket } from 'lucide-react'
import { TOURNAMENT_PRIZES } from '@/lib/constants/clubPolicy'
import { Badge } from '@/components/ui/badge'

export function TournamentPrizeBoard() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#E6AF2E]/30 bg-gradient-to-br from-[#1C1608] via-[#12131D] to-[#0A0B10] p-4 sm:p-5 shadow-2xl">
      {/* Glow Effect */}
      <div className="absolute -right-10 -top-10 size-36 rounded-full bg-[#E6AF2E]/15 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[#E6AF2E]/20">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5D061] to-[#C28B1E] text-black font-black text-sm shadow">
            <Trophy className="size-4" />
          </div>
          <div>
            <h3 className="font-serif text-sm sm:text-base font-bold text-white tracking-wide">
              FLOP 정규 토너먼트 시상 공지
            </h3>
            <p className="text-[10.5px] text-[#9CA3AF]">
              시드권 5,000P · 리바인 5,000P
            </p>
          </div>
        </div>
        <Badge className="bg-[#E6AF2E]/20 text-[#F5D061] border border-[#E6AF2E]/30 text-[10px] px-2 py-0.5">
          공식 시상
        </Badge>
      </div>

      {/* Prize List Grid */}
      <div className="space-y-2">
        {TOURNAMENT_PRIZES.map((item, idx) => (
          <div
            key={item.rank}
            className={`flex items-center justify-between rounded-2xl p-2.5 sm:p-3 transition-all ${
              idx === 0
                ? 'bg-gradient-to-r from-amber-500/20 via-amber-950/40 to-[#181A26] border border-amber-400/50 shadow-md shadow-yellow-500/10'
                : idx === 1
                ? 'bg-gradient-to-r from-slate-400/15 via-slate-900/40 to-[#181A26] border border-slate-400/30'
                : idx === 2
                ? 'bg-gradient-to-r from-amber-700/20 to-[#181A26] border border-amber-600/30'
                : 'bg-[#141520] border border-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">{item.icon}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-black ${
                    idx === 0
                      ? 'text-[#F5D061]'
                      : idx === 1
                      ? 'text-slate-200'
                      : idx === 2
                      ? 'text-amber-300'
                      : 'text-zinc-300'
                  }`}>
                    {item.rank}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-zinc-300 font-mono">
                    {item.badge}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className={`text-xs sm:text-sm font-bold ${
                idx === 0 ? 'text-[#FFF0A5] font-extrabold' : 'text-white'
              }`}>
                {item.prize}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
