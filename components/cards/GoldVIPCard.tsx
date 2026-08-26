'use client'

import { useState } from 'react'
import { Crown, QrCode, Sparkles, TrendingUp, ShieldCheck, ChevronRight, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Profile } from '@/types/database.types'
import { formatPoints, getTierMeta } from '@/lib/utils/format'
import { MemberQRModal } from '@/components/qr/MemberQRModal'
import Link from 'next/link'

interface GoldVIPCardProps {
  profile: Partial<Profile>
  onOpenQR?: () => void
}

export function GoldVIPCard({ profile, onOpenQR }: GoldVIPCardProps) {
  const [qrModalOpen, setQrModalOpen] = useState(false)

  const handleOpenQR = () => {
    if (onOpenQR) {
      onOpenQR()
    } else {
      setQrModalOpen(true)
    }
  }

  const tier = profile.tier || 'VIP'
  const points = profile.total_points ?? 24500
  const name = profile.name || '김민준'
  const nickname = profile.nickname || 'AceKing'
  const tierMeta = getTierMeta(tier)

  return (
    <>
      <div className="relative w-full overflow-hidden rounded-3xl p-[1px] bg-gradient-to-br from-[#FFF0A5] via-[#E6AF2E] to-[#734A08] shadow-2xl shadow-yellow-600/20 group">
        {/* Shimmer metallic light sweep */}
        <div className="shimmer-light" />

        {/* Card Body */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-[23px] bg-gradient-to-br from-[#242738] via-[#161722] to-[#0A0B10] p-6 sm:p-7 min-h-[225px] border border-[#F5D061]/30 border-t-white/20 shadow-2xl">
          
          {/* Subtle Ambient Background Watermark Pattern */}
          <div className="absolute right-0 top-0 size-64 -translate-y-16 translate-x-16 rounded-full border border-[#F5D061]/15 pointer-events-none" />
          <div className="absolute right-12 top-6 size-44 rounded-full border border-[#F5D061]/20 pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 size-48 rounded-full bg-[#E6AF2E]/10 blur-2xl pointer-events-none" />

          {/* Card Header: Club Brand & Tier Badge */}
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5D061] to-[#C28B1E] text-black shadow-md shadow-yellow-500/20 font-serif font-black text-sm">
                ♠
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#F3E5AB] font-bold">
                  FLOP POKER CLUB
                </p>
                <p className="text-[11px] font-medium text-[#9CA3AF]">
                  원주 프리미엄 멤버십
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={`${tierMeta.badgeClass} px-2.5 py-1 text-[11px] uppercase tracking-wider font-extrabold shadow-md`}>
                <Crown className="size-3 mr-1 inline-block" />
                {tierMeta.label}
              </Badge>
            </div>
          </div>

          {/* Card Middle: Balance Information */}
          <div className="relative z-10 my-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-widest text-[#F3E5AB]/80">
                보유 포인트 (BALANCE)
              </span>
              <Link 
                href="/ledger"
                className="flex items-center gap-1 text-[11px] text-[#F5D061] hover:text-[#FFF0A5] transition-colors"
              >
                원장 확인 <ChevronRight className="size-3" />
              </Link>
            </div>
            
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(245,208,97,0.3)]">
                {new Intl.NumberFormat('ko-KR').format(points)}
              </span>
              <span className="font-serif text-lg font-bold text-[#F5D061]">P</span>
            </div>
          </div>

          {/* Card Footer: User Info & QR Trigger Button */}
          <div className="relative z-10 flex items-end justify-between border-t border-[#E6AF2E]/20 pt-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-wide">
                  {name}
                </span>
                <span className="text-xs text-[#9CA3AF]">
                  (@{nickname})
                </span>
              </div>
              <p className="font-mono text-[10px] text-[#9CA3AF] tracking-wider mt-0.5">
                NO. FLP-2024-{(profile.qr_token || '8839').slice(0, 4).toUpperCase()}
              </p>
            </div>

            {/* 원터치 [내 QR 코드] 버튼 */}
            <Button
              onClick={handleOpenQR}
              className="group/btn relative overflow-hidden bg-gradient-to-r from-[#F5D061] via-[#E6AF2E] to-[#C28B1E] text-black font-bold text-xs h-9 px-4 rounded-xl shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <QrCode className="size-4 mr-1.5 transition-transform group-hover/btn:rotate-6" />
              <span>내 QR 코드</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Internal QR Modal if triggered standalone */}
      <MemberQRModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        profile={profile}
      />
    </>
  )
}
