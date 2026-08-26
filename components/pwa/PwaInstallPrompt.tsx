'use client'

import { useState, useEffect } from 'react'
import { Download, X, Share, PlusSquare, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIos, setIsIos] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // 1. Check if already installed & running standalone
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true

    setIsStandalone(isStandaloneMode)
    if (isStandaloneMode) return

    // 2. Check if dismissed before in this session
    const dismissed = sessionStorage.getItem('flop_pwa_dismissed')
    if (dismissed) return

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent)
    if (isIosDevice && isSafari) {
      setIsIos(true)
      // Show iOS guide after 3 seconds
      const timer = setTimeout(() => setShowPrompt(true), 2500)
      return () => clearTimeout(timer)
    }

    // 4. Android / Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // 5. Register service worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service worker registration failed:', err)
      })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    sessionStorage.setItem('flop_pwa_dismissed', 'true')
  }

  if (isStandalone || !showPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="relative overflow-hidden rounded-2xl border border-[#E6AF2E]/40 bg-gradient-to-r from-[#1E2130] via-[#141624] to-[#0D0E17] p-4 text-white shadow-2xl shadow-black/80 backdrop-blur-xl">
        {/* Shimmer light sweep */}
        <div className="shimmer-light pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 text-[#9CA3AF] hover:text-white transition-colors"
          aria-label="닫기"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          {/* Logo Spade Icon */}
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5D061] to-[#C28B1E] text-black font-serif font-black text-lg shadow-md shadow-yellow-500/20">
            ♠
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm font-bold text-white">
                FLOP 앱으로 바로가기
              </span>
              <Badge className="bg-[#E6AF2E]/20 text-[#F5D061] border-[#E6AF2E]/40 text-[9px] px-1.5 py-0">
                PWA APP
              </Badge>
            </div>

            {isIos ? (
              <p className="text-[11px] text-[#F3E5AB] leading-relaxed">
                사파리 하단 <Share className="inline size-3.5 mx-0.5 text-[#F5D061]" /> <strong>공유</strong> 버튼 ➔{' '}
                <PlusSquare className="inline size-3.5 mx-0.5 text-[#F5D061]" /> <strong>홈 화면에 추가</strong>를 누르면 전체화면 앱으로 실행됩니다.
              </p>
            ) : (
              <p className="text-[11.5px] text-[#9CA3AF] leading-snug">
                홈 화면에 앱을 설치하여 브라우저 주소창 없이 초고속 원클릭으로 접속하세요.
              </p>
            )}

            {!isIos && deferredPrompt && (
              <div className="pt-1.5">
                <Button
                  size="sm"
                  onClick={handleInstallClick}
                  className="h-8 w-full rounded-xl bg-gradient-to-r from-[#F5D061] via-[#E6AF2E] to-[#C28B1E] text-black font-extrabold text-xs shadow-md shadow-yellow-500/25 hover:scale-[1.02] transition-transform"
                >
                  <Download className="size-3.5 mr-1.5" />
                  홈 화면에 앱 설치하기
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
