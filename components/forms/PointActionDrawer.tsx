'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Minus,
  Lock
} from 'lucide-react'
import { Profile, PointReason } from '@/types/database.types'
import { getPointReasonMeta } from '@/lib/utils/format'
import { processStaffPointAction } from '@/lib/actions/admin'

interface PointActionDrawerProps {
  isOpen: boolean
  onClose: () => void
  member: Partial<Profile> | null
  onSuccess?: (txData: { amount: number; reason: PointReason; newBalance: number }) => void
}

interface PresetAction {
  id: string
  title: string
  subtitle: string
  amount: number
  reason: PointReason
  gradient: string
  badgeColor: string
}

interface PresetGroup {
  label: string
  actions: PresetAction[]
}

const PRESET_GROUPS: PresetGroup[] = [
  {
    label: '핸드 보너스',
    actions: [
      {
        id: 'four-of-a-kind',
        title: '투핸드 포카드',
        subtitle: 'Two-hand Four of a Kind',
        amount: 100,
        reason: 'FOUR_OF_A_KIND',
        gradient: 'from-emerald-600/30 to-emerald-950/50 border-emerald-500/40 text-emerald-300',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      },
      {
        id: 'straight-flush',
        title: '스트레이트 플러시',
        subtitle: 'Straight Flush',
        amount: 200,
        reason: 'STRAIGHT_FLUSH',
        gradient: 'from-purple-600/30 to-purple-950/50 border-purple-500/40 text-purple-300',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      },
      {
        id: 'royal-flush',
        title: '로열 스트레이트 플러시',
        subtitle: 'Royal Flush',
        amount: 300,
        reason: 'ROYAL_FLUSH',
        gradient: 'from-amber-500/30 to-amber-950/50 border-amber-500/40 text-[#F5D061]',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      },
    ],
  },
  {
    label: '이벤트 / 구매',
    actions: [
      {
        id: 'new-member',
        title: '신규회원 가입',
        subtitle: 'New Member Registration',
        amount: 100,
        reason: 'EVENT_BONUS',
        gradient: 'from-sky-600/30 to-sky-950/50 border-sky-500/40 text-sky-300',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      },
      {
        id: 'cash-buyin-10',
        title: '현금 바인권 10매 구매',
        subtitle: 'Cash Buy-in × 10',
        amount: 300,
        reason: 'EVENT_BONUS',
        gradient: 'from-blue-600/30 to-blue-950/50 border-blue-500/40 text-blue-300',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      },
    ],
  },
  {
    label: '토너먼트 우승',
    actions: [
      {
        id: 'tourney-small',
        title: '1등 (6프라이즈 이하)',
        subtitle: '7 prizes未満 Tournament',
        amount: 100,
        reason: 'TOURNAMENT_WIN',
        gradient: 'from-amber-600/30 to-amber-950/50 border-amber-500/40 text-amber-300',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      },
      {
        id: 'tourney-mid',
        title: '1등 (7~10프라이즈)',
        subtitle: '7–10 prizes Tournament',
        amount: 200,
        reason: 'TOURNAMENT_WIN',
        gradient: 'from-amber-600/30 to-amber-950/50 border-amber-500/40 text-amber-300',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      },
      {
        id: 'tourney-large',
        title: '1등 (10+ 프라이즈)',
        subtitle: '10+ prizes Tournament',
        amount: 300,
        reason: 'TOURNAMENT_WIN',
        gradient: 'from-amber-500/30 to-amber-950/50 border-amber-400/50 text-[#F5D061]',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      },
    ],
  },
]

export function PointActionDrawer({
  isOpen,
  onClose,
  member,
  onSuccess,
}: PointActionDrawerProps) {
  const [selectedAction, setSelectedAction] = useState<PresetAction | null>(null)
  const [isManualMode, setIsManualMode] = useState(false)
  const [manualType, setManualType] = useState<'EARN' | 'DEDUCT'>('EARN')
  const [manualAmount, setManualAmount] = useState('')
  const [manualReason, setManualReason] = useState<PointReason>('ADMIN_ADJUSTMENT')
  const [manualDescription, setManualDescription] = useState('')

  // Confirmation & Processing State
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [successResult, setSuccessResult] = useState<{
    amount: number
    reason: PointReason
    newBalance: number
  } | null>(null)

  if (!member) return null

  const currentPoints = member.total_points ?? 0

  // Handle Preset Click
  const handleSelectPreset = (action: PresetAction) => {
    setSelectedAction(action)
    setIsManualMode(false)
    setConfirmModalOpen(true)
  }

  // Handle Manual Submit Click
  const handleManualSubmit = () => {
    const num = parseInt(manualAmount.replace(/[^0-9]/g, ''), 10)
    if (isNaN(num) || num <= 0) return

    const actualAmount = manualType === 'EARN' ? num : -num
    if (manualType === 'DEDUCT' && currentPoints < num) {
      alert(`잔액이 부족합니다. (현재 잔액: ${currentPoints}p)`)
      return
    }

    setSelectedAction({
      id: 'manual',
      title: manualType === 'EARN' ? '수동 포인트 지급' : '수동 포인트 차감',
      subtitle: manualDescription || (manualType === 'EARN' ? '관리자 수동 지급' : '매장 포인트 사용'),
      amount: actualAmount,
      reason: manualReason,
      gradient: manualType === 'EARN' ? 'from-emerald-600/30 to-emerald-950/50' : 'from-rose-600/30 to-rose-950/50',
      badgeColor: manualType === 'EARN' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300',
    })
    setConfirmModalOpen(true)
  }

  // Execute Transaction
  const handleExecuteTransaction = async () => {
    if (!selectedAction || isProcessing || !member.id) return

    setIsProcessing(true)

    try {
      const res = await processStaffPointAction({
        targetUserId: member.id,
        amount: selectedAction.amount,
        reason: selectedAction.reason,
        description: selectedAction.subtitle,
      })

      if (!res.success) {
        alert(res.error || '포인트 처리에 실패했습니다.')
        setIsProcessing(false)
        return
      }

      const newBal = res.newBalance ?? (currentPoints + selectedAction.amount)
      const successData = {
        amount: selectedAction.amount,
        reason: selectedAction.reason,
        newBalance: newBal,
      }

      setIsProcessing(false)
      setConfirmModalOpen(false)
      setSuccessResult(successData)
      onSuccess?.(successData)

      // Auto dismiss success after 2 seconds
      setTimeout(() => {
        setSuccessResult(null)
        onClose()
      }, 2000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      alert(msg || '오류가 발생했습니다.')
      setIsProcessing(false)
    }
  }

  const calculatedBalanceAfter = selectedAction ? currentPoints + selectedAction.amount : currentPoints

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md border-[#E6AF2E]/30 bg-[#13141C] text-white p-6 shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
          {/* Member Profile Header */}
          <DialogHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F5D061] to-[#C28B1E] text-black font-black text-base shadow">
                  ♠
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white">
                      {member.name || member.nickname}
                    </span>
                  </div>
                  <p className="text-xs text-[#9CA3AF]">
                    @{member.nickname} · {member.phone || '010-XXXX-XXXX'}
                  </p>
                </div>
              </div>

              {/* Current Points Badge */}
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#9CA3AF]">
                  현재 잔액
                </span>
                <p className="font-serif text-lg font-black text-[#F5D061] leading-none mt-0.5">
                  {new Intl.NumberFormat('ko-KR').format(currentPoints)}p
                </p>
              </div>
            </div>

            <div className="h-px w-full bg-[#E6AF2E]/20" />
            <DialogTitle className="text-sm font-bold text-[#F3E5AB] flex items-center gap-1.5">
              <Zap className="size-4 text-[#E6AF2E]" />
              원터치 포인트 지급 / 차감
            </DialogTitle>
          </DialogHeader>

          {/* Success Overlay Animation */}
          {successResult ? (
            <div className="py-10 text-center space-y-3 animate-in fade-in zoom-in duration-300">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg">
                <CheckCircle2 className="size-10" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white">
                포인트 처리 완료!
              </h3>
              <p className="text-sm text-emerald-400 font-mono font-bold">
                +{new Intl.NumberFormat('ko-KR').format(successResult.amount)}p ({getPointReasonMeta(successResult.reason).shortLabel})
              </p>
              <div className="rounded-xl bg-[#181A26] p-3 text-xs text-[#9CA3AF] max-w-xs mx-auto">
                새 잔액: <strong className="text-[#F5D061] font-mono">{new Intl.NumberFormat('ko-KR').format(successResult.newBalance)}p</strong>
              </div>
            </div>
          ) : (
            <div className="space-y-4 my-2">
              {/* Preset Action Buttons — Grouped */}
              <div className="space-y-3">
                {PRESET_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-1.5">
                      {group.label}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {group.actions.map((action) => (
                        <button
                          key={action.id}
                          onClick={() => handleSelectPreset(action)}
                          className={`relative flex flex-col justify-between rounded-2xl border p-2.5 text-left transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-br ${action.gradient}`}
                        >
                          <span className="text-[11px] font-bold text-white leading-tight line-clamp-2">
                            {action.title}
                          </span>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="font-mono text-base font-black text-white">
                              +{new Intl.NumberFormat('ko-KR').format(action.amount)}p
                            </span>
                            <Zap className="size-3 opacity-70" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mode Toggle Button */}
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsManualMode(!isManualMode)}
                  className="w-full h-10 rounded-xl border-[#E6AF2E]/30 bg-[#181A26] text-xs font-semibold text-[#F3E5AB] hover:bg-[#E6AF2E]/10"
                >
                  {isManualMode ? '원터치 모드로 돌아가기' : '수동 금액 입력 / 차감 모드 열기'}
                </Button>
              </div>

              {/* Manual Input Container */}
              {isManualMode && (
                <div className="space-y-3 rounded-2xl border border-[#E6AF2E]/25 bg-[#0F1017] p-4 animate-in fade-in duration-200">
                  {/* Type Toggle: 지급(+) / 차감(-) */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={manualType === 'EARN' ? 'default' : 'outline'}
                      onClick={() => setManualType('EARN')}
                      className={`h-9 rounded-xl text-xs font-bold ${
                        manualType === 'EARN'
                          ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                          : 'border-border text-[#9CA3AF]'
                      }`}
                    >
                      <Plus className="size-3.5 mr-1" /> 포인트 지급 (+)
                    </Button>
                    <Button
                      type="button"
                      variant={manualType === 'DEDUCT' ? 'default' : 'outline'}
                      onClick={() => setManualType('DEDUCT')}
                      className={`h-9 rounded-xl text-xs font-bold ${
                        manualType === 'DEDUCT'
                          ? 'bg-rose-500 text-white hover:bg-rose-400'
                          : 'border-border text-[#9CA3AF]'
                      }`}
                    >
                      <Minus className="size-3.5 mr-1" /> 포인트 차감 (-)
                    </Button>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-[#9CA3AF] font-medium">
                      포인트 금액
                    </label>
                    <div className="relative">
                      <Input
                        value={manualAmount}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '')
                          setManualAmount(val ? new Intl.NumberFormat('ko-KR').format(parseInt(val, 10)) : '')
                        }}
                        placeholder="0"
                        className="h-11 rounded-xl border-[#E6AF2E]/30 bg-[#13141C] text-right pr-8 font-mono text-base font-bold text-white focus-visible:border-[#E6AF2E]"
                      />
                      <span className="absolute right-3 top-3 text-xs font-bold text-[#F5D061]">P</span>
                    </div>
                  </div>

                  {/* Quick Amount Helper Chips */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
                    {['100', '200', '300', '500', '1,000'].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setManualAmount(chip)}
                        className="rounded-lg border border-[#E6AF2E]/20 bg-[#181A26] px-2.5 py-1 text-[11px] text-[#F3E5AB] hover:bg-[#E6AF2E]/10 shrink-0"
                      >
                        +{chip}p
                      </button>
                    ))}
                  </div>

                  {/* Description / Reason */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-[#9CA3AF] font-medium">
                      사유 및 비고
                    </label>
                    <Input
                      value={manualDescription}
                      onChange={(e) => setManualDescription(e.target.value)}
                      placeholder="예: 토너먼트 우승 상금, 음료 결제 등"
                      className="h-9 rounded-xl border-[#E6AF2E]/25 bg-[#13141C] text-xs text-white placeholder:text-[#9CA3AF]"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleManualSubmit}
                    disabled={!manualAmount || manualAmount === '0'}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-[#F5D061] via-[#E6AF2E] to-[#C28B1E] text-black font-bold text-xs shadow-md"
                  >
                    수동 금액 처리 확인
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Policy footer */}
          <div className="rounded-xl bg-[#0B0B0F] p-3 text-[10.5px] text-[#9CA3AF] flex items-center gap-2 border border-[#E6AF2E]/10">
            <Lock className="size-3.5 text-[#E6AF2E] shrink-0" />
            <span>원장 기록은 Stored Procedure 락을 통해 안전하게 저장됩니다.</span>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Step Modal */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="max-w-sm border-[#E6AF2E]/40 bg-[#13141C] text-white p-6 shadow-2xl rounded-2xl">
          <DialogHeader className="text-center space-y-2">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#E6AF2E]/15 border border-[#E6AF2E]/30 text-[#E6AF2E]">
              <AlertTriangle className="size-6 text-[#F5D061]" />
            </div>
            <DialogTitle className="text-lg font-bold text-white">
              포인트 변경 확인
            </DialogTitle>
            <DialogDescription className="text-xs text-[#9CA3AF]">
              아래 내용으로 포인트 원장에 기록하시겠습니까?
            </DialogDescription>
          </DialogHeader>

          {selectedAction && (
            <div className="rounded-2xl border border-[#E6AF2E]/20 bg-[#181A26] p-4 space-y-3 my-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#9CA3AF]">대상 회원</span>
                <span className="font-bold text-white">{member.name} (@{member.nickname})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#9CA3AF]">처리 항목</span>
                <span className="font-bold text-[#F3E5AB]">{selectedAction.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#9CA3AF]">변동 금액</span>
                <span
                  className={`font-mono text-base font-black ${
                    selectedAction.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {selectedAction.amount > 0 ? '+' : ''}{new Intl.NumberFormat('ko-KR').format(selectedAction.amount)}p
                </span>
              </div>
              <div className="h-px bg-[#E6AF2E]/15" />
              <div className="flex justify-between items-center pt-1">
                <span className="text-[#9CA3AF]">처리 후 잔액</span>
                <span className="font-mono text-sm font-bold text-[#F5D061]">
                  {new Intl.NumberFormat('ko-KR').format(calculatedBalanceAfter)}p
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => setConfirmModalOpen(false)}
              disabled={isProcessing}
              className="flex-1 border-[#E6AF2E]/30 bg-[#181A26] text-white hover:bg-[#E6AF2E]/10"
            >
              취소
            </Button>
            <Button
              onClick={handleExecuteTransaction}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-[#F5D061] via-[#E6AF2E] to-[#C28B1E] text-black font-bold hover:opacity-90"
            >
              {isProcessing ? '원장 처리 중...' : '확인 및 지급'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
