'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  ScanLine,
  Users,
  Trophy,
  ReceiptText,
  TrendingUp,
  Clock3,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Zap,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPoints, formatDateTime, getPointReasonMeta } from '@/lib/utils/format'
import { PointTransaction } from '@/types/database.types'

const mockTodayTx: PointTransaction[] = [
  {
    id: 'tx-201',
    user_id: 'usr-1',
    amount: 500,
    balance_after: 24500,
    reason: 'FOUR_OF_A_KIND',
    description: '김민준 회원 포카드 적립',
    processed_by: 'Staff 민혁',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'tx-202',
    user_id: 'usr-2',
    amount: 1000,
    balance_after: 128400,
    reason: 'STRAIGHT_FLUSH',
    description: '이서윤 회원 스티플 적립',
    processed_by: 'Staff 민혁',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'tx-203',
    user_id: 'usr-3',
    amount: -10000,
    balance_after: 8500,
    reason: 'TOURNAMENT_BUYIN',
    description: '박준혁 회원 Friday High Roller 접수',
    processed_by: 'System',
    created_at: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
  },
  {
    id: 'tx-204',
    user_id: 'usr-4',
    amount: 5000,
    balance_after: 55000,
    reason: 'EVENT_BONUS',
    description: '최태양 회원 10장 현금 보너스',
    processed_by: 'Staff 수빈',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="size-5 text-[#E6AF2E]" />
            <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
              매장 운영 현황 대시보드
            </h1>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            원주점 실시간 회원 입장, 포인트 거래 원장 및 토너먼트 진행 현황입니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs px-3 py-1 font-bold">
            <span className="size-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
            SYSTEM ONLINE
          </Badge>
        </div>
      </div>

      {/* Main Action Banner: Fast QR Scanner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#E6AF2E]/40 bg-gradient-to-r from-[#2B1B06] via-[#1A181C] to-[#0E0F16] p-6 shadow-2xl shadow-yellow-500/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <Badge className="bg-gradient-to-r from-[#F5D061] to-[#E6AF2E] text-black font-extrabold text-[11px] px-2.5 py-0.5">
            초고속 현장 응대
          </Badge>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            직원용 카메라 QR 스캐너
          </h2>
          <p className="text-xs sm:text-sm text-[#F3E5AB]/90 max-w-lg leading-relaxed">
            회원의 QR 코드를 카메라로 비추면 1초 내로 프로필을 감지하여 원터치 핸드 보너스(+500P/+1,000P/+3,000P)를 즉시 지급할 수 있습니다.
          </p>
        </div>

        <Link href="/admin/scanner" className="w-full sm:w-auto shrink-0">
          <Button className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-gradient-to-r from-[#F5D061] via-[#E6AF2E] to-[#C28B1E] text-black font-black text-sm shadow-xl shadow-yellow-500/30 hover:scale-105 transition-all">
            <ScanLine className="size-5 mr-2" />
            스캐너 실행하기
          </Button>
        </Link>
      </div>

      {/* Daily Metrics 4-Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="border border-[#E6AF2E]/20 bg-[#13141C] rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#9CA3AF] font-medium">오늘 방문 회원</p>
              <p className="font-serif text-2xl font-bold text-white mt-1">42 <span className="text-xs text-[#9CA3AF] font-sans">명</span></p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#E6AF2E]/10 text-[#E6AF2E]">
              <Users className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#E6AF2E]/20 bg-[#13141C] rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#9CA3AF] font-medium">오늘 지급 포인트</p>
              <p className="font-serif text-2xl font-bold text-emerald-400 mt-1">+38,500 <span className="text-xs font-sans">P</span></p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <ArrowUpRight className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#E6AF2E]/20 bg-[#13141C] rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#9CA3AF] font-medium">오늘 사용/차감</p>
              <p className="font-serif text-2xl font-bold text-rose-400 mt-1">-10,000 <span className="text-xs font-sans">P</span></p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
              <ArrowDownLeft className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#E6AF2E]/20 bg-[#13141C] rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#9CA3AF] font-medium">예정/진행 토너</p>
              <p className="font-serif text-2xl font-bold text-[#F5D061] mt-1">2 <span className="text-xs text-[#9CA3AF] font-sans">개</span></p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#E6AF2E]/10 text-[#E6AF2E]">
              <Trophy className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Real-time Audit Transactions */}
      <div className="rounded-3xl border border-[#E6AF2E]/20 bg-[#13141C] p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ReceiptText className="size-4 text-[#E6AF2E]" />
            <h3 className="font-serif text-base font-bold text-white">
              최근 매장 포인트 트랜잭션 기록
            </h3>
          </div>
          <Link href="/admin/members" className="text-xs text-[#F5D061] hover:underline flex items-center gap-0.5">
            전체 회원 관리 <ChevronRight className="size-3" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {mockTodayTx.map((tx) => {
            const meta = getPointReasonMeta(tx.reason)
            const isPositive = tx.amount > 0

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-2xl border border-[#E6AF2E]/15 bg-[#181A26] p-3.5 hover:border-[#E6AF2E]/40 transition-all text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-9 items-center justify-center rounded-xl border ${
                      isPositive
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {isPositive ? <ArrowUpRight className="size-4" /> : <ArrowDownLeft className="size-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{meta.label}</span>
                      <span className="text-[11px] text-[#9CA3AF]">({tx.description})</span>
                    </div>
                    <p className="text-[10.5px] text-[#9CA3AF] mt-0.5">
                      {formatDateTime(tx.created_at, 'full')} · 처리: {tx.processed_by}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono text-sm font-black ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {formatPoints(tx.amount, true)}
                  </span>
                  <p className="font-mono text-[10px] text-[#9CA3AF] mt-0.5">
                    잔액 {formatPoints(tx.balance_after)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
