'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Crown,
  User,
  Phone,
  Check,
  ArrowRight,
  Gift,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatPhone } from '@/lib/utils/format'
import { checkNicknameAvailable, saveProfile } from '@/lib/actions/onboarding'

export default function OnboardingPage() {
  const router = useRouter()
  const { update } = useSession()

  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [phone, setPhone] = useState('')
  const [nicknameChecked, setNicknameChecked] = useState(false)
  const [nicknameAvailable, setNicknameAvailable] = useState(false)
  const [isCheckingNickname, setIsCheckingNickname] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    if (raw.length <= 11) {
      setPhone(formatPhone(raw))
    }
  }

  const handleCheckNickname = async () => {
    if (!nickname.trim()) return
    setIsCheckingNickname(true)
    setNicknameChecked(false)
    try {
      const available = await checkNicknameAvailable(nickname.trim())
      setNicknameAvailable(available)
      setNicknameChecked(true)
    } finally {
      setIsCheckingNickname(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !nickname || !phone || !nicknameChecked || !nicknameAvailable) return

    setIsSubmitting(true)
    setError(null)
    try {
      const result = await saveProfile({
        name: name.trim(),
        nickname: nickname.trim(),
        phone: phone.replace(/-/g, ''),
        termsVersion: 'v1.0',
      })

      if (!result.success) {
        setError(result.error ?? '저장에 실패했습니다.')
        return
      }

      // JWT 토큰 갱신 후 홈으로 이동
      await update()
      router.push('/')
      router.refresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid =
    name.trim().length >= 2 &&
    nickname.trim().length >= 2 &&
    phone.length >= 12 &&
    nicknameChecked &&
    nicknameAvailable &&
    agreed

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-transparent text-white selection:bg-[#E6AF2E]/30 overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-[#E6AF2E]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F5D061] to-[#C28B1E] text-black font-serif text-2xl font-black shadow-lg shadow-yellow-500/25">
            ♠
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
            회원 기본 정보 설정
          </h1>
          <p className="text-xs text-[#9CA3AF]">
            원활한 매장 서비스 및 포인트 적립을 위해 필수 정보를 입력해 주세요.
          </p>
        </div>

        {/* Welcome Reward Alert */}
        <div className="flex items-center gap-3 rounded-2xl border border-[#E6AF2E]/30 bg-gradient-to-r from-[#241B08] to-[#14151D] p-3.5 shadow-lg">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5D061] to-[#E6AF2E] text-black shadow">
            <Gift className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#F3E5AB]">신규 가입 보너스</span>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px] px-1.5 py-0">
                +500 P
              </Badge>
            </div>
            <p className="text-[10.5px] text-[#9CA3AF]">
              온보딩 완료 즉시 포인트 원장에 적립됩니다.
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-400">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-[#E6AF2E]/30 bg-gradient-to-br from-[#181A26] via-[#14151E] to-[#0E0F16] p-6 shadow-2xl space-y-4"
        >
          {/* 이름 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#F3E5AB] flex items-center gap-1.5">
              <User className="size-3.5 text-[#E6AF2E]" /> 이름 (실명)
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 김민준"
              className="border-[#E6AF2E]/25 bg-[#13141C] text-sm h-11 text-white placeholder:text-[#9CA3AF] rounded-xl focus-visible:border-[#E6AF2E]"
              required
            />
          </div>

          {/* 닉네임 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#F3E5AB] flex items-center gap-1.5">
              <Crown className="size-3.5 text-[#E6AF2E]" /> 클럽 닉네임
            </label>
            <div className="flex gap-2">
              <Input
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value)
                  setNicknameChecked(false)
                  setNicknameAvailable(false)
                }}
                placeholder="예: AceKing"
                className="border-[#E6AF2E]/25 bg-[#13141C] text-sm h-11 text-white placeholder:text-[#9CA3AF] rounded-xl focus-visible:border-[#E6AF2E] flex-1"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleCheckNickname}
                disabled={!nickname.trim() || isCheckingNickname}
                className="h-11 border-[#E6AF2E]/30 bg-[#1A1C28] text-xs text-[#F3E5AB] hover:bg-[#E6AF2E]/10 shrink-0"
              >
                {isCheckingNickname ? (
                  '확인 중...'
                ) : nicknameChecked ? (
                  nicknameAvailable ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="size-3.5" /> 사용 가능
                    </span>
                  ) : (
                    <span className="text-rose-400">사용 불가</span>
                  )
                ) : (
                  '중복 확인'
                )}
              </Button>
            </div>
            <p className="text-[10px] text-[#9CA3AF]">
              테이블 쇼다운 및 랭킹에 표시될 이름입니다.
            </p>
          </div>

          {/* 전화번호 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#F3E5AB] flex items-center gap-1.5">
              <Phone className="size-3.5 text-[#E6AF2E]" /> 휴대폰 번호
            </label>
            <Input
              value={phone}
              onChange={handlePhoneChange}
              placeholder="010-1234-5678"
              className="border-[#E6AF2E]/25 bg-[#13141C] text-sm h-11 text-white placeholder:text-[#9CA3AF] rounded-xl focus-visible:border-[#E6AF2E] font-mono"
              required
            />
          </div>

          {/* 동의 */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 text-xs text-[#9CA3AF] cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 rounded accent-[#E6AF2E]"
              />
              <span>
                (필수){' '}
                <Link href="/terms" target="_blank" className="underline text-[#F3E5AB] hover:text-white">
                  이용약관
                </Link>{' '}
                및{' '}
                <Link href="/privacy" target="_blank" className="underline text-[#F3E5AB] hover:text-white">
                  개인정보처리방침
                </Link>
                에 동의합니다. (만 19세 이상)
              </span>
            </label>
          </div>

          {/* Submit */}
          {!isFormValid && !isSubmitting && (
            <p className="text-[11px] text-amber-400 text-center -mb-1">
              {!nicknameChecked
                ? '닉네임 중복 확인을 완료해 주세요.'
                : !nicknameAvailable
                ? '사용 가능한 닉네임을 입력해 주세요.'
                : name.trim().length < 2
                ? '이름을 2자 이상 입력해 주세요.'
                : phone.length < 12
                ? '휴대폰 번호를 입력해 주세요.'
                : '모든 항목을 입력해 주세요.'}
            </p>
          )}
          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#F5D061] via-[#E6AF2E] to-[#C28B1E] text-black font-bold text-sm shadow-lg shadow-yellow-500/25 hover:opacity-95 transition-all mt-2"
          >
            {isSubmitting ? (
              '등록 처리 중...'
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                멤버십 시작하기 (+500 P 받기) <ArrowRight className="size-4" />
              </span>
            )}
          </Button>
        </form>

        <p className="text-center text-[11px] text-[#9CA3AF]">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-[#F5D061] underline">
            로그인으로 이동
          </Link>
        </p>
      </div>
    </div>
  )
}
