'use client'

import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import {
  Camera,
  ScanLine,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface StaffQRScannerProps {
  onScanSuccess: (qrToken: string) => void
  isScanning?: boolean
}

export function StaffQRScanner({
  onScanSuccess,
  isScanning = true,
}: StaffQRScannerProps) {
  const [cameraActive, setCameraActive] = useState(false)
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [scannedFeedback, setScannedFeedback] = useState(false)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [lastScannedText, setLastScannedText] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const handleTriggerScan = (token: string) => {
    if (scannedFeedback || lastScannedText === token) return
    setLastScannedText(token)
    setScannedFeedback(true)

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.(100)
    }

    setTimeout(() => {
      setScannedFeedback(false)
      onScanSuccess(token)
    }, 400)

    // Reset last scanned cooldown after 3 seconds
    setTimeout(() => {
      setLastScannedText(null)
    }, 3000)
  }

  useEffect(() => {
    let isMounted = true
    const readerElementId = 'qr-camera-stream-box'

    const startScanner = async () => {
      try {
        // Clear existing instance if any
        if (scannerRef.current) {
          try {
            if (scannerRef.current.isScanning) {
              await scannerRef.current.stop()
            }
            await scannerRef.current.clear()
          } catch {
            // ignore
          }
          scannerRef.current = null
        }

        const elem = document.getElementById(readerElementId)
        if (!elem || !isMounted) return

        const scanner = new Html5Qrcode(readerElementId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        })
        scannerRef.current = scanner

        await scanner.start(
          { facingMode },
          {
            fps: 15,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight)
              const qrboxSize = Math.max(180, Math.floor(minEdge * 0.75))
              return { width: qrboxSize, height: qrboxSize }
            },
          },
          (decodedText) => {
            if (isMounted) {
              handleTriggerScan(decodedText)
            }
          },
          () => {
            // Frame scan in progress
          }
        )

        if (isMounted) {
          setCameraActive(true)
          setHasCameraPermission(true)
        }
      } catch (err) {
        console.warn('QR Scanner start error:', err)
        if (isMounted) {
          setCameraActive(false)
          setHasCameraPermission(false)
        }
      }
    }

    if (isScanning) {
      startScanner()
    }

    return () => {
      isMounted = false
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(() => {}).then(() => {
            scannerRef.current?.clear()
          })
        } else {
          scannerRef.current.clear()
        }
      }
    }
  }, [isScanning, facingMode])

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-[#E6AF2E]/30 bg-gradient-to-br from-[#181A26] to-[#0F1017] p-5 shadow-2xl space-y-4">
      {/* Top Console Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl bg-[#E6AF2E]/15 text-[#E6AF2E] border border-[#E6AF2E]/30">
            <Camera className="size-4" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-white tracking-wide">
              초고속 멤버십 QR 스캐너
            </h3>
            <p className="text-[10.5px] text-[#9CA3AF]">
              카메라로 회원 QR을 비추면 1초 즉시 인식됩니다
            </p>
          </div>
        </div>

        {hasCameraPermission === false ? (
          <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30 text-[10px] px-2 py-0.5 flex items-center gap-1 font-bold">
            <AlertCircle className="size-3" />
            카메라 권한 필요
          </Badge>
        ) : (
          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] px-2 py-0.5 flex items-center gap-1 font-bold">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            스캐너 작동 중
          </Badge>
        )}
      </div>

      {/* Viewfinder Camera Box */}
      <div className="relative mx-auto flex aspect-square max-h-[320px] w-full items-center justify-center overflow-hidden rounded-2xl bg-black border-2 border-[#E6AF2E]/40 shadow-inner">
        {/* Html5Qrcode video container */}
        <div id="qr-camera-stream-box" className="size-full [&_video]:size-full [&_video]:object-cover" />

        {/* Dark overlay with gold frame target */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative size-56 sm:size-64 border border-[#E6AF2E]/40 rounded-2xl flex items-center justify-center overflow-hidden">
            {/* 4 Corner Gold Brackets */}
            <div className="absolute top-0 left-0 size-6 border-t-4 border-l-4 border-[#F5D061] rounded-tl-lg" />
            <div className="absolute top-0 right-0 size-6 border-t-4 border-r-4 border-[#F5D061] rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 size-6 border-b-4 border-l-4 border-[#F5D061] rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 size-6 border-b-4 border-r-4 border-[#F5D061] rounded-br-lg" />

            {/* Animated Laser Scanning Line */}
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#F5D061] to-transparent shadow-[0_0_15px_#F5D061] animate-[pulse_1.5s_ease-in-out_infinite]" />

            {/* Center Feedback */}
            {scannedFeedback ? (
              <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500 text-black animate-bounce shadow-lg shadow-emerald-500/50">
                <CheckCircle2 className="size-8" />
              </div>
            ) : (
              <span className="font-mono text-[11px] uppercase tracking-widest text-[#F3E5AB]/90 font-bold bg-[#0B0B0F]/80 px-2.5 py-1 rounded-full border border-[#E6AF2E]/30">
                QR 코드를 맞춰주세요
              </span>
            )}
          </div>
        </div>

        {/* Floating Controls */}
        <div className="absolute bottom-3 right-3">
          <Button
            size="sm"
            type="button"
            variant="ghost"
            onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
            className="h-8 px-2.5 rounded-full bg-black/60 backdrop-blur border border-white/10 text-white text-[11px] hover:bg-black/80 cursor-pointer"
          >
            <RotateCcw className="size-3.5 mr-1" /> 카메라 전환
          </Button>
        </div>
      </div>
    </div>
  )
}
