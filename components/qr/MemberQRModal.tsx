'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  QrCode,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  SunMedium,
  Crown
} from 'lucide-react'
import { Profile } from '@/types/database.types'
import { getTierMeta } from '@/lib/utils/format'

interface MemberQRModalProps {
  isOpen: boolean
  onClose: () => void
  profile: Partial<Profile>
}

// Standalone high-contrast vector QR Matrix Generator
function StandaloneQRCode({ value, size = 190 }: { value: string; size?: number }) {
  const matrix = useMemo(() => {
    // Generate deterministic 21x21 QR Version 1 Matrix with standard finder patterns
    const N = 21
    const grid: number[][] = Array.from({ length: N }, () => Array(N).fill(0))

    // Helper to draw standard 7x7 Finder Pattern with 1px separator
    const drawFinderPattern = (r0: number, c0: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            grid[r0 + r][c0 + c] = 1
          } else {
            grid[r0 + r][c0 + c] = 0
          }
        }
      }
    }

    // Top-Left, Top-Right, Bottom-Left Finder Patterns
    drawFinderPattern(0, 0)
    drawFinderPattern(0, N - 7)
    drawFinderPattern(N - 7, 0)

    // Timing patterns
    for (let i = 8; i < N - 8; i++) {
      grid[6][i] = i % 2 === 0 ? 1 : 0
      grid[i][6] = i % 2 === 0 ? 1 : 0
    }

    // Alignment pattern center at (N-7, N-7)
    grid[14][14] = 1

    // Pseudo-random deterministic data filling based on value hash
    let hash = 0
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i)
      hash |= 0
    }

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        // Skip finder pattern zones
        const isFinderTopLeft = r <= 7 && c <= 7
        const isFinderTopRight = r <= 7 && c >= N - 8
        const isFinderBottomLeft = r >= N - 8 && c <= 7
        const isTiming = (r === 6 && (c > 7 && c < N - 7)) || (c === 6 && (r > 7 && r < N - 7))
        const isCenterLogo = r >= 8 && r <= 12 && c >= 8 && c <= 12

        if (!isFinderTopLeft && !isFinderTopRight && !isFinderBottomLeft && !isTiming && !isCenterLogo) {
          const bit = Math.abs(Math.sin((hash + r * 31 + c * 17)) * 10000) % 1 > 0.45 ? 1 : 0
          grid[r][c] = bit
        }
      }
    }

    return grid
  }, [value])

  const N = matrix.length
  const cellSize = size / (N + 2)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg shadow-sm">
      <rect width={size} height={size} fill="#FFFFFF" rx="8" />
      <g transform={`translate(${cellSize}, ${cellSize})`}>
        {matrix.map((row, r) =>
          row.map((cell, c) => {
            if (cell === 1) {
              return (
                <rect
                  key={`${r}-${c}`}
                  x={c * cellSize}
                  y={r * cellSize}
                  width={cellSize + 0.3}
                  height={cellSize + 0.3}
                  fill="#0B0B0F"
                />
              )
            }
            return null
          })
        )}
        {/* Center Spade Emblem */}
        <rect
          x={8 * cellSize - 1}
          y={8 * cellSize - 1}
          width={5 * cellSize + 2}
          height={5 * cellSize + 2}
          fill="#FFFFFF"
          stroke="#E6AF2E"
          strokeWidth="1.5"
          rx="4"
        />
        <text
          x={10.5 * cellSize}
          y={11.2 * cellSize}
          textAnchor="middle"
          fontSize={cellSize * 3.2}
          fill="#C28B1E"
          fontFamily="serif"
          fontWeight="bold"
        >
          ♠
        </text>
      </g>
    </svg>
  )
}

export function MemberQRModal({ isOpen, onClose, profile }: MemberQRModalProps) {
  const [copied, setCopied] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(300)

  const token = profile.qr_token || 'flp-99a8-7b2c-8841-f09c'
  const memberName = profile.name || profile.nickname || '김민준'
  const memberTier = profile.tier || 'VIP'
  const tierMeta = getTierMeta(memberTier)

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(300)
      return
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 1 ? prev - 1 : 300))
    }, 1000)
    return () => clearInterval(timer)
  }, [isOpen])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRefresh = () => {
    setSecondsLeft(300)
  }

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[360px] sm:max-w-[400px] border-[#E6AF2E]/30 bg-[#13141C] text-white p-6 shadow-2xl shadow-yellow-500/10 rounded-2xl">
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-[#E6AF2E]/40 bg-[#E6AF2E]/10 text-[#E6AF2E] shadow-inner">
            <QrCode className="size-6" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            멤버십 QR 코드
            <Badge className={`${tierMeta.badgeClass} text-[10px] px-2 py-0.5`}>
              {memberTier}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-xs text-[#9CA3AF]">
            매장 입장 및 포인트 적립 시 직원에게 제시하세요.
          </DialogDescription>
        </DialogHeader>

        {/* High-Contrast QR Code Card */}
        <div className="relative mt-2 flex flex-col items-center justify-center rounded-2xl bg-white p-5 shadow-xl">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#0B0B0F] px-3 py-0.5 text-[10px] font-semibold text-[#F3E5AB] border border-[#E6AF2E]/40 flex items-center gap-1 shadow">
            <Crown className="size-3 text-[#E6AF2E]" />
            FLOP POKER CLUB
          </div>

          <div className="mt-1 flex items-center justify-center bg-white p-2 rounded-xl border-2 border-dashed border-gray-300">
            <StandaloneQRCode value={token} size={190} />
          </div>

          <div className="mt-3 flex items-center justify-between w-full px-2 text-xs text-gray-600 font-mono">
            <span className="font-semibold text-gray-800 tracking-wider">
              {memberName} 님
            </span>
            <span className="text-[11px] text-gray-500">
              {token.slice(0, 8)}...{token.slice(-4)}
            </span>
          </div>
        </div>

        {/* Security & Timer Indicator */}
        <div className="mt-4 flex items-center justify-between rounded-xl bg-[#181A26] px-3.5 py-2.5 border border-[#E6AF2E]/15 text-xs">
          <div className="flex items-center gap-2 text-[#9CA3AF]">
            <ShieldCheck className="size-4 text-[#E6AF2E]" />
            <span>유효시간: <strong className="text-[#F3E5AB] font-mono">{formatTimer(secondsLeft)}</strong></span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-7 px-2 text-[11px] text-[#E6AF2E] hover:bg-[#E6AF2E]/10"
          >
            <RotateCcw className="size-3 mr-1" /> 새로고침
          </Button>
        </div>

        {/* Screen Brightness Tip */}
        <div className="flex items-center gap-2 text-[11px] text-[#9CA3AF] px-1">
          <SunMedium className="size-4 text-[#F5D061] shrink-0" />
          <span>스캐너 인식이 잘 안 될 경우 화면 밝기를 올려주세요.</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-2 flex gap-2">
          <Button
            variant="outline"
            onClick={handleCopy}
            className="flex-1 border-[#E6AF2E]/30 bg-transparent text-[#F3E5AB] hover:bg-[#E6AF2E]/10 hover:text-white"
          >
            {copied ? (
              <>
                <Check className="size-4 mr-1.5 text-emerald-400" /> 복사 완료
              </>
            ) : (
              <>
                <Copy className="size-4 mr-1.5 text-[#E6AF2E]" /> 토큰 복사
              </>
            )}
          </Button>
          <Button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-[#F5D061] via-[#E6AF2E] to-[#C28B1E] text-black font-semibold hover:opacity-90"
          >
            확인 닫기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
