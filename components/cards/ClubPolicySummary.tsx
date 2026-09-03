'use client'

import { useState } from 'react'
import { Sparkles, Zap, Coins, Flame, CalendarCheck, HelpCircle } from 'lucide-react'
import { POINT_BENEFIT_SECTIONS } from '@/lib/constants/clubPolicy'

export function ClubPolicySummary() {
  const [activeTab, setActiveTab] = useState<number>(0)

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#E6AF2E]/25 bg-gradient-to-br from-[#181A28] via-[#12131D] to-[#0A0B10] p-4 sm:p-5 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#E6AF2E]/15">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5D061] to-[#C28B1E] text-black font-black text-xs shadow">
            <Coins className="size-4" />
          </div>
          <div>
            <h3 className="font-serif text-sm sm:text-base font-bold text-white tracking-wide">
              포인트 적립 & 혜택 정책
            </h3>
            <p className="text-[10.5px] text-[#9CA3AF]">
              신규가입, 결제, 족보, 대회 우승 포인트
            </p>
          </div>
        </div>
      </div>

      {/* Category Pills (Tabs) */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {POINT_BENEFIT_SECTIONS.map((sec, idx) => (
          <button
            key={sec.category}
            onClick={() => setActiveTab(idx)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all ${
              activeTab === idx
                ? 'bg-gradient-to-r from-[#F5D061] via-[#E6AF2E] to-[#C28B1E] text-black shadow-md'
                : 'bg-[#181A26] border border-[#E6AF2E]/20 text-[#9CA3AF] hover:text-[#F3E5AB]'
            }`}
          >
            {sec.category}
          </button>
        ))}
      </div>

      {/* Selected Category Items */}
      <div className="mt-2 space-y-2">
        {POINT_BENEFIT_SECTIONS[activeTab]?.items.map((item) => {
          const isPositive = item.point.startsWith('+')
          const isNegative = item.point.startsWith('-')

          return (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#141520] p-3 hover:border-[#E6AF2E]/30 transition-all"
            >
              <div>
                <span className="text-xs font-bold text-white block">
                  {item.label}
                </span>
                <span className="text-[10.5px] text-[#9CA3AF]">
                  {item.desc}
                </span>
              </div>

              <div className="text-right">
                <span className={`font-mono text-sm font-black ${
                  isPositive
                    ? 'text-emerald-400'
                    : isNegative
                    ? 'text-rose-400'
                    : 'text-[#F5D061]'
                }`}>
                  {item.point}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
