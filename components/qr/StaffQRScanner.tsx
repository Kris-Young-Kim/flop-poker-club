'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Camera,
  ScanLine,
  Flashlight,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Zap,
  Users,
  Search
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
  const [torchActive, setTorchActive] = useState(false)
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
  const [scannedFeedback, setScannedFeedback] = useState(false)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Start Camera Stream
  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
        setCameraActive(true)
        setHasCameraPermission(true)
      } else {
        setCameraActive(true)
        setHasCameraPermission(true)
      }
    } catch (err) {
      console.warn('Camera access fallback mode:', err)
      setCameraActive(true) // Fallback simulation mode
      setHasCameraPermission(false)
    }
  }

  // Stop Camera Stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

  useEffect(() => {
    if (isScanning) {
      startCamera()
    } else {
      stopCamera()
    }
    return () => {
      stopCamera()
    }
  }, [isScanning, facingMode])

  // Trigger Scan
  const handleTriggerScan = (token: string) => {
    setScannedFeedback(true)
    // Haptic feedback if supported on mobile
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.(100)
    }
    setTimeout(() => {
      setScannedFeedback(false)
      onScanSuccess(token)
    }, 400)
  }

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
              후면 카메라 1초 자동 인식 모드
            </p>
          </div>
        </div>

        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] px-2 py-0.5 flex items-center gap-1 font-bold">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          스캐너 준비됨
        </Badge>
      </div>

      {/* Viewfinder Camera Box */}
      <div className="relative mx-auto flex aspect-square max-h-[320px] w-full items-center justify-center overflow-hidden rounded-2xl bg-black border-2 border-[#E6AF2E]/40 shadow-inner">
        {/* Real Video element or Ambient Simulation */}
        <video
          ref={videoRef}
          playsInline
          muted
          className="absolute inset-0 size-full object-cover opacity-80"
        />

        {/* Dark overlay with clear center square */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        {/* Viewfinder Aim Target with Glowing Corner Brackets */}
        <div className="relative size-56 sm:size-64 border border-[#E6AF2E]/30 rounded-2xl flex items-center justify-center overflow-hidden">
          {/* 4 Corner Gold Brackets */}
          <div className="absolute top-0 left-0 size-6 border-t-4 border-l-4 border-[#F5D061] rounded-tl-lg" />
          <div className="absolute top-0 right-0 size-6 border-t-4 border-r-4 border-[#F5D061] rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 size-6 border-b-4 border-l-4 border-[#F5D061] rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 size-6 border-b-4 border-r-4 border-[#F5D061] rounded-br-lg" />

          {/* Animated Laser Scanning Line */}
          <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#F5D061] to-transparent shadow-[0_0_15px_#F5D061] animate-[pulse_1.8s_ease-in-out_infinite]" />

          {/* Center Target Indicator */}
          <div className="flex flex-col items-center justify-center text-center p-4">
            {scannedFeedback ? (
              <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500 text-black animate-bounce shadow-lg shadow-emerald-500/50">
                <CheckCircle2 className="size-8" />
              </div>
            ) : (
              <>
                <ScanLine className="size-12 text-[#E6AF2E]/80 animate-pulse" />
                <span className="mt-2 font-mono text-[11px] uppercase tracking-widest text-[#F3E5AB]/90 font-bold bg-[#0B0B0F]/80 px-2.5 py-1 rounded-full border border-[#E6AF2E]/30">
                  QR 코드를 맞춰주세요
                </span>
              </>
            )}
          </div>
        </div>

        {/* Floating Viewfinder Controls */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
            className="h-8 px-2.5 rounded-full bg-black/60 backdrop-blur border border-white/10 text-white text-[11px] hover:bg-black/80"
          >
            <RotateCcw className="size-3.5 mr-1" /> 카메라 전환
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setTorchActive(!torchActive)}
            className={`h-8 px-2.5 rounded-full backdrop-blur border text-[11px] ${
              torchActive
                ? 'bg-[#E6AF2E] text-black font-bold border-[#E6AF2E]'
                : 'bg-black/60 text-white border-white/10 hover:bg-black/80'
            }`}
          >
            <Flashlight className="size-3.5 mr-1" /> 플래시 {torchActive ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>

      {/* Quick Test / Manual Scan Simulator Buttons */}
      <div className="space-y-2 pt-1 border-t border-[#E6AF2E]/15">
        <p className="text-[11px] text-[#9CA3AF] flex items-center gap-1 font-semibold">
          <Zap className="size-3 text-[#E6AF2E]" />
          빠른 회원 테스트 스캔 (원클릭 시뮬레이션):
        </p>

        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            onClick={() => handleTriggerScan('flp-99a8-7b2c-8841-f09c')}
            className="h-9 rounded-xl border border-[#E6AF2E]/30 bg-[#14151E] text-xs font-bold text-[#F3E5AB] hover:bg-[#E6AF2E]/15"
          >
            김민준 (VIP · 24,500P)
          </Button>
          <Button
            size="sm"
            onClick={() => handleTriggerScan('flp-royal-8811-2244')}
            className="h-9 rounded-xl border border-yellow-500/40 bg-[#1A1810] text-xs font-bold text-yellow-300 hover:bg-yellow-500/20"
          >
            이서윤 (ROYAL · 128,400P)
          </Button>
        </div>
      </div>
    </div>
  )
}
