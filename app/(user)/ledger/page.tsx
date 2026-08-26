'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  ReceiptText,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PointTransaction } from '@/types/database.types'
import { formatPoints, formatDateTime, getPointReasonMeta } from '@/lib/utils/format'
import { getMyTransactions } from '@/lib/actions/ledger'
import { getCurrentProfile } from '@/lib/actions/user'
import { toast } from 'sonner'

export default function PointLedgerPage() {
  const [transactions, setTransactions] = useState<PointTransaction[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [activeTab, setActiveTab] = useState<'ALL' | 'EARN' | 'SPEND'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReason, setSelectedReason] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getMyTransactions(), getCurrentProfile()])
      .then(([txs, profile]) => {
        setTransactions(txs)
        setTotalPoints(profile?.total_points ?? 0)
      })
      .catch(() => toast.error('데이터를 불러오지 못했습니다. 다시 시도해 주세요.'))
      .finally(() => setLoading(false))
  }, [])

  const totalEarned = transactions.filter((tx) => tx.amount > 0).reduce((a, c) => a + c.amount, 0)
  const totalSpent = transactions.filter((tx) => tx.amount < 0).reduce((a, c) => a + Math.abs(c.amount), 0)

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (activeTab === 'EARN' && tx.amount <= 0) return false
      if (activeTab === 'SPEND' && tx.amount >= 0) return false
      if (selectedReason !== 'ALL' && tx.reason !== selectedReason) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const meta = getPointReasonMeta(tx.reason)
        if (
          !meta.label.toLowerCase().includes(q) &&
          !(tx.description ?? '').toLowerCase().includes(q) &&
          !tx.processed_by.toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
  }, [transactions, activeTab, selectedReason, searchQuery])

  return (
    <div className="space-y-5">
      {/* Header */}
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

      {/* Balance Summary */}
      <div className="rounded-3xl border border-[#E6AF2E]/30 bg-gradient-to-br from-[#1C1A14] via-[#14151D] to-[#0E0F16] p-5 shadow-2xl shadow-yellow-500/5">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#F3E5AB]/80 font-semibold">
              CURRENT TOTAL BALANCE
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-serif text-3xl sm:text-4xl font-black text-white drop-shadow-[0_2px_10px_rgba(245,208,97,0.25)]">
                {loading ? '---' : new Intl.NumberFormat('ko-KR').format(totalPoints)}
              </span>
              <span className="font-serif text-lg font-bold text-[#F5D061]">P</span>
            </div>
          </div>
          <Badge className="bg-[#E6AF2E]/15 border border-[#E6AF2E]/30 text-[#F5D061] text-[10px] px-2.5 py-1">
            무결성 보장
          </Badge>
        </div>
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'ALL' | 'EARN' | 'SPEND')} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#13141C] border border-[#E6AF2E]/20 p-1 rounded-2xl h-11">
          <TabsTrigger
            value="ALL"
            className="rounded-xl text-xs font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#F5D061] data-[state=active]:to-[#E6AF2E] data-[state=active]:text-black"
          >
            전체 ({transactions.length})
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

      {/* Search & Filter Chips */}
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
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { key: 'ALL', label: '전체 사유' },
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
        {loading ? (
          <div className="rounded-2xl border border-dashed border-[#E6AF2E]/20 bg-[#13141C]/50 p-8 text-center text-sm text-[#9CA3AF]">
            불러오는 중...
          </div>
        ) : filteredTransactions.length === 0 ? (
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
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${
                        isPositive
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      {isPositive ? <ArrowUpRight className="size-5" /> : <ArrowDownLeft className="size-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          className={`text-[10px] font-bold px-2 rounded-full border ${
                            isPositive
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {meta.shortLabel}
                        </Badge>
                        <span className="text-xs font-bold text-white">{meta.label}</span>
                      </div>
                      {tx.description && (
                        <p className="text-xs text-[#F3E5AB]/90 mt-1 leading-snug">{tx.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-[#9CA3AF] mt-1.5">
                        <span>{formatDateTime(tx.created_at, 'full')}</span>
                        <span>•</span>
                        <span>처리: {tx.processed_by}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-mono text-base sm:text-lg font-black ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
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

      {/* Policy Notice */}
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
