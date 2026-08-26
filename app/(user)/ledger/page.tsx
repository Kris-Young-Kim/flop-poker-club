'use client'

import { useState, useMemo } from 'react'
import {
  ReceiptText,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Search,
  ShieldCheck,
  Info,
  ChevronDown
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PointTransaction, PointReason } from '@/types/database.types'
import { formatPoints, formatDateTime, getPointReasonMeta } from '@/lib/utils/format'

const mockLedgerData: PointTransaction[] = [
  {
    id: 'tx-001',
    user_id: 'usr-1',
    amount: 500,
    balance_after: 24500,
    reason: 'FOUR_OF_A_KIND',
    description: '투핸드 A 포카드 승리 보너스',
    processed_by: 'Staff 민혁',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'tx-002',
    user_id: 'usr-1',
    amount: -10000,
    balance_after: 24000,
    reason: 'TOURNAMENT_BUYIN',
    description: 'Friday Night High Roller 토너먼트 참가 신청',
    processed_by: 'System',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'tx-003',
    user_id: 'usr-1',
    amount: 1000,
    balance_after: 34000,
    reason: 'STRAIGHT_FLUSH',
    description: '스페이드 스트레이트 플러시 승리',
    processed_by: 'Staff 수빈',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'tx-004',
    user_id: 'usr-1',
    amount: 15000,
    balance_after: 33000,
    reason: 'TOURNAMENT_WIN',
    description: '원주 데일리 딥스택 3위 입상 상금 포인트',
    processed_by: 'Admin 호진',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: 'tx-005',
    user_id: 'usr-1',
    amount: 3000,
    balance_after: 18000,
    reason: 'ROYAL_FLUSH',
    description: '하트 로열 스트레이트 플러시 대박 보너스',
    processed_by: 'Staff 민혁',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: 'tx-006',
    user_id: 'usr-1',
    amount: -2000,
    balance_after: 15000,
    reason: 'POINT_SHOP_USAGE',
    description: 'VIP 라운지 프리미엄 음료 및 스낵 이용',
    processed_by: 'Staff 수빈',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
  },
  {
    id: 'tx-007',
    user_id: 'usr-1',
    amount: 5000,
    balance_after: 17000,
    reason: 'EVENT_BONUS',
    description: 'FLOP 멤버십 웰컴 가입 보너스',
    processed_by: 'System',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
  },
]

export default function PointLedgerPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'EARN' | 'SPEND'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReason, setSelectedReason] = useState<string>('ALL')

  const totalPoints = 24500
  const totalEarned = mockLedgerData.filter((tx) => tx.amount > 0).reduce((acc, cur) => acc + cur.amount, 0)
  const totalSpent = mockLedgerData.filter((tx) => tx.amount < 0).reduce((acc, cur) => acc + Math.abs(cur.amount), 0)

  const filteredTransactions = useMemo(() => {
    return mockLedgerData.filter((tx) => {
      // 1. Tab filter
      if (activeTab === 'EARN' && tx.amount <= 0) return false
      if (activeTab === 'SPEND' && tx.amount >= 0) return false

      // 2. Reason filter
      if (selectedReason !== 'ALL' && tx.reason !== selectedReason) return false

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const meta = getPointReasonMeta(tx.reason)
        const matchTitle = meta.label.toLowerCase().includes(q)
        const matchDesc = (tx.description || '').toLowerCase().includes(q)
        const matchProcessor = tx.processed_by.toLowerCase().includes(q)
        if (!matchTitle && !matchDesc && !matchProcessor) return false
      }

      return true
    })
  }, [activeTab, selectedReason, searchQuery])

  return (
    <div className="space-y-5">
      {/* Header Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ReceiptText className="size-5 text-[#E6AF2E]" />
            <h1 className="font-serif text-xl font-bold tracking-tight text-white">
              포인트 원장 (LEDGER)
            </h1>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            위·변조가 불가능한 회원님의 포인트 불변 거래 내역입니다.
          </p>
        </div>
      </div>

      {/* Point Summary Cards */}
      <div className="rounded-3xl border border-[#E6AF2E]/30 bg-gradient-to-br from-[#1C1A14] via-[#14151D] to-[#0E0F16] p-5 shadow-2xl shadow-yellow-500/5">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#F3E5AB]/80 font-semibold">
              CURRENT TOTAL BALANCE
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-serif text-3xl sm:text-4xl font-black text-white drop-shadow-[0_2px_10px_rgba(245,208,97,0.25)]">
                {new Intl.NumberFormat('ko-KR').format(totalPoints)}
              </span>
              <span className="font-serif text-lg font-bold text-[#F5D061]">P</span>
            </div>
          </div>
          <Badge className="bg-[#E6AF2E]/15 border border-[#E6AF2E]/30 text-[#F5D061] text-[10px] px-2.5 py-1">
            무결성 보장
          </Badge>
        </div>

        {/* Earned vs Spent summary */}
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#E6AF2E]/15 pt-4">
          <div className="flex items-center gap-2.5 rounded-xl bg-[#181A26]/80 p-2.5 border border-[#E6AF2E]/10">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <ArrowUpRight className="size-4" />
            </div>
            <div>
              <p className="text-[10px] text-[#9CA3AF]">총 적립 내역</p>
              <p className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">
                +{new Intl.NumberFormat('ko-KR').format(totalEarned)} P
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl bg-[#181A26]/80 p-2.5 border border-[#E6AF2E]/10">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400">
              <ArrowDownLeft className="size-4" />
            </div>
            <div>
              <p className="text-[10px] text-[#9CA3AF]">총 사용/차감</p>
              <p className="text-xs sm:text-sm font-bold text-rose-400 font-mono">
                -{new Intl.NumberFormat('ko-KR').format(totalSpent)} P
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Filter (All / Earn / Spend) */}
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
            전체 ({mockLedgerData.length})
          </TabsTrigger>
          <TabsTrigger
            value="EARN"
            className="rounded-xl text-xs font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#F5D061] data-[state=active]:to-[#E6AF2E] data-[state=active]:text-black"
          >
            적립만 (+)
          </TabsTrigger>
          <TabsTrigger
            value="SPEND"
            className="rounded-xl text-xs font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#F5D061] data-[state=active]:to-[#E6AF2E] data-[state=active]:text-black"
          >
            차감만 (-)
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search & Reason Chip Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 size-4 text-[#9CA3AF]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="사유, 내용 또는 담당자 검색..."
            className="border-[#E6AF2E]/20 bg-[#13141C] pl-10 text-xs h-10 text-white placeholder:text-[#9CA3AF] rounded-xl focus-visible:border-[#E6AF2E]"
          />
        </div>

        {/* Reason Quick Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <Button
            size="sm"
            variant={selectedReason === 'ALL' ? 'default' : 'outline'}
            onClick={() => setSelectedReason('ALL')}
            className={`h-7 rounded-full text-[11px] px-3 ${
              selectedReason === 'ALL'
                ? 'bg-[#E6AF2E] text-black font-bold'
                : 'border-[#E6AF2E]/20 bg-[#13141C] text-[#9CA3AF]'
            }`}
          >
            전체 사유
          </Button>
          {[
            { key: 'FOUR_OF_A_KIND', label: '포카드' },
            { key: 'STRAIGHT_FLUSH', label: '스티플' },
            { key: 'ROYAL_FLUSH', label: '로티플' },
            { key: 'TOURNAMENT_WIN', label: '토너우승' },
            { key: 'TOURNAMENT_BUYIN', label: '대회참가' },
            { key: 'EVENT_BONUS', label: '이벤트' },
            { key: 'POINT_SHOP_USAGE', label: '매장사용' },
          ].map((r) => (
            <Button
              key={r.key}
              size="sm"
              variant={selectedReason === r.key ? 'default' : 'outline'}
              onClick={() => setSelectedReason(r.key)}
              className={`h-7 rounded-full text-[11px] px-3 shrink-0 ${
                selectedReason === r.key
                  ? 'bg-[#E6AF2E] text-black font-bold'
                  : 'border-[#E6AF2E]/20 bg-[#13141C] text-[#9CA3AF]'
              }`}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-2.5">
        {filteredTransactions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E6AF2E]/20 bg-[#13141C]/50 p-8 text-center">
            <ReceiptText className="mx-auto size-10 text-[#9CA3AF]/50" />
            <p className="mt-2 text-sm font-medium text-[#9CA3AF]">
              해당하는 포인트 내역이 없습니다.
            </p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const meta = getPointReasonMeta(tx.reason)
            const isPositive = tx.amount > 0

            return (
              <div
                key={tx.id}
                className="group relative overflow-hidden rounded-2xl border border-[#E6AF2E]/20 bg-gradient-to-br from-[#181A26] to-[#12131A] p-4 hover:border-[#E6AF2E]/50 transition-all shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Icon based on positive / negative */}
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${
                        isPositive
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="size-5" />
                      ) : (
                        <ArrowDownLeft className="size-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                            isPositive
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {meta.shortLabel}
                        </Badge>
                        <span className="text-xs font-bold text-white">
                          {meta.label}
                        </span>
                      </div>

                      {tx.description && (
                        <p className="text-xs text-[#F3E5AB]/90 mt-1 leading-snug">
                          {tx.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-[10px] text-[#9CA3AF] mt-1.5">
                        <span>{formatDateTime(tx.created_at, 'full')}</span>
                        <span>•</span>
                        <span>처리: {tx.processed_by}</span>
                      </div>
                    </div>
                  </div>

                  {/* Points amount and balance after */}
                  <div className="text-right shrink-0">
                    <p
                      className={`font-mono text-base sm:text-lg font-black ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatPoints(tx.amount, true)}
                    </p>
                    <p className="font-mono text-[11px] text-[#9CA3AF] mt-0.5">
                      잔액 {formatPoints(tx.balance_after)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Ledger Policy Notice */}
      <div className="rounded-2xl border border-[#E6AF2E]/15 bg-[#0F1017] p-4 text-xs text-[#9CA3AF] space-y-1.5">
        <div className="flex items-center gap-2 text-[#F3E5AB] font-bold">
          <ShieldCheck className="size-4 text-[#E6AF2E]" />
          포인트 정책 및 무결성 고지
        </div>
        <p className="text-[11px] leading-relaxed">
          • 포인트는 매장 공식 스태프에 의해서만 안전하게 적립 및 차감됩니다.<br />
          • 바인권은 매장 종이 티켓으로만 유통되며 앱 내 포인트로 교환되지 않습니다.<br />
          • 회원 간 포인트 양도/송금 및 현금 환급은 불가합니다.
        </p>
      </div>
    </div>
  )
}
