'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import {
  Crown,
  ShieldCheck,
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
  HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    await signIn('google', { callbackUrl: '/' })
  }

  const handleDemoAccess = () => {
    router.push('/onboarding')
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-transparent text-white selection:bg-[#E6AF2E]/30 overflow-hidden">
      {/* Background Ambience & Casino Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-[#E6AF2E]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 size-72 rounded-full bg-[#9C6B14]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm space-y-7">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#F5D061] via-[#E6AF2E] to-[#C28B1E] text-black font-serif text-3xl font-black shadow-2xl shadow-yellow-500/30">
            ♠
          </div>
          
          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="font-serif text-3xl font-extrabold tracking-wider text-white">
                FLOP
              </h1>
              <Badge className="bg-[#E6AF2E]/15 border border-[#E6AF2E]/30 text-[#F5D061] text-[10px] font-bold">
                원주 VIP LOUNGE
              </Badge>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#9CA3AF] mt-1">
              PREMIUM MEMBERSHIP CLUB
            </p>
          </div>
        </div>

        {/* Login Box */}
        <div className="rounded-3xl border border-[#E6AF2E]/30 bg-gradient-to-br from-[#181A26] via-[#14151E] to-[#0E0F16] p-6 sm:p-7 shadow-2xl shadow-yellow-500/10 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-white tracking-tight">
              회원 간편 로그인
            </h2>
            <p className="text-xs text-[#9CA3AF]">
              구글 계정으로 1초 만에 안전하게 시작하세요.
            </p>
          </div>

          {/* Google OAuth Login Button */}
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-12 rounded-2xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-sm shadow-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            {/* Google SVG Logo */}
            <svg className="size-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isLoading ? '인증 진행 중...' : 'Google 계정으로 계속하기'}</span>
          </Button>

          {/* Member Benefits Preview */}
          <div className="rounded-2xl bg-[#0F1017] p-3.5 border border-[#E6AF2E]/15 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#F3E5AB]">
              <Crown className="size-3.5 text-[#E6AF2E]" />
              멤버십 기본 혜택
            </div>
            <ul className="space-y-1.5 text-[11px] text-[#9CA3AF]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
                <span>신규 가입 즉시 <strong>5,000 P</strong> 웰컴 보너스</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
                <span>투핸드 포카드 / 스티플 / 로티플 현장 즉시 적립</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
                <span>토너먼트 실시간 접수 및 랭킹 조회</span>
              </li>
            </ul>
          </div>

          {/* Guest Demo Preview Button */}
          <div className="pt-2 border-t border-[#E6AF2E]/15 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDemoAccess}
              className="text-xs text-[#9CA3AF] hover:text-[#F3E5AB] hover:bg-transparent"
            >
              로그인 없이 클럽 둘러보기 <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </div>
        </div>

        {/* Terms & Legal Compliance Notice */}
        <p className="text-center text-[10.5px] text-[#9CA3AF]/70 leading-relaxed px-2">
          로그인 시 FLOP POKER CLUB의{' '}
          <Link href="/notices?tab=RULE" className="underline text-[#F3E5AB]/80 hover:text-white">
            이용약관
          </Link>{' '}
          및{' '}
          <Link href="/notices?tab=RULE" className="underline text-[#F3E5AB]/80 hover:text-white">
            개인정보처리방침
          </Link>
          에 동의하게 됩니다. 본 서비스는 만 19세 이상 성인 전용입니다.
        </p>
      </div>
    </div>
  )
}
