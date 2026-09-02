'use client'

import { useState, useEffect } from 'react'
import {
  ScanLine,
  Search,
  Users,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock3,
  UserCheck,
  Crown,
  Loader2
} from 'lucide-react'
import { StaffQRScanner } from '@/components/qr/StaffQRScanner'
import { PointActionDrawer } from '@/components/forms/PointActionDrawer'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Profile } from '@/types/database.types'
import { formatPoints } from '@/lib/utils/format'
import { searchMemberByQr } from '@/lib/actions/admin'

export default function AdminScannerPage() {
  const [selectedMember, setSelectedMember] = useState<Partial<Profile> | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [recentScans, setRecentScans] = useState<Partial<Profile>[]>([])
  const [searchResults, setSearchResults] = useState<Partial<Profile>[]>([])

  // Called when QR token detected
  const handleScanSuccess = async (qrToken: string) => {
    try {
      const found = await searchMemberByQr(qrToken)
      if (found) {
        setSelectedMember(found)
        setDrawerOpen(true)
        setRecentScans((prev) => [found, ...prev.filter((p) => p.id !== found.id)].slice(0, 5))
      } else {
        alert('일치하는 회원 정보를 찾을 수 없습니다.')
      }
    } catch (e) {
      console.error('Scan error:', e)
      alert('스캔 처리 중 오류가 발생했습니다.')
    }
  }

  // Handle live search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const found = await searchMemberByQr(searchQuery)
        setSearchResults(found ? [found] : [])
      } catch (e) {
        console.error(e)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Handle Manual Selection
  const handleSelectMember = (member: Partial<Profile>) => {
    setSelectedMember(member)
    setDrawerOpen(true)
    setRecentScans((prev) => [member, ...prev.filter((p) => p.id !== member.id)].slice(0, 5))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <ScanLine className="size-5 text-[#E6AF2E]" />
          <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
            직원용 현장 QR 스캐너
          </h1>
        </div>
        <p className="text-xs text-[#9CA3AF] mt-0.5">
          카메라로 회원의 QR 코드를 스캔하거나 수동으로 검색하여 즉시 포인트를 지급하세요.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
        {/* Left Column: Camera QR Scanner */}
        <div className="space-y-4">
          <StaffQRScanner onScanSuccess={handleScanSuccess} />
        </div>

        {/* Right Column: Search Fallback & Recent Scanned Members */}
        <div className="space-y-5">
          {/* Manual Member Search Box */}
          <div className="rounded-3xl border border-[#E6AF2E]/25 bg-[#13141C] p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Search className="size-4 text-[#E6AF2E]" />
              수동 회원 검색 (QR 미소지 시)
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-3 size-4 text-[#9CA3AF]" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="이름, 닉네임 또는 전화번호 뒤 4자리..."
                className="h-10 rounded-xl border-[#E6AF2E]/30 bg-[#181A26] pl-10 text-xs text-white placeholder:text-[#9CA3AF] focus-visible:border-[#E6AF2E]"
              />
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] text-[#9CA3AF]">검색 결과 ({searchResults.length}건):</p>
                <div className="space-y-1.5">
                  {searchResults.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleSelectMember(m)}
                      className="flex items-center justify-between rounded-xl border border-[#E6AF2E]/20 bg-[#181A26] p-3 hover:border-[#E6AF2E]/50 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-[#E6AF2E]/10 text-[#E6AF2E] font-bold text-xs">
                          ♠
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white">{m.name}</span>
                          <p className="text-[10.5px] text-[#9CA3AF]">@{m.nickname} · {m.phone}</p>
                        </div>
                      </div>
                      <Button size="sm" className="h-7 px-2.5 rounded-lg bg-[#E6AF2E] text-black font-bold text-[11px]">
                        지급 선택
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent Scanned Members in this Session */}
          <div className="rounded-3xl border border-[#E6AF2E]/25 bg-[#13141C] p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Clock3 className="size-4 text-[#E6AF2E]" />
                최근 스캔 회원 목록
              </div>
              <span className="text-[11px] text-[#9CA3AF]">{recentScans.length}명 대기</span>
            </div>

            <div className="space-y-2">
              {recentScans.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleSelectMember(m)}
                  className="flex items-center justify-between rounded-2xl border border-[#E6AF2E]/15 bg-[#181A26] p-3 hover:border-[#E6AF2E]/40 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5D061] to-[#C28B1E] text-black font-bold text-sm shadow">
                      ♠
                    </div>
                    <div>
                      <span className="font-bold text-sm text-white group-hover:text-[#F3E5AB]">
                        {m.name}
                      </span>
                      <p className="text-[11px] text-[#9CA3AF]">
                        @{m.nickname} · 잔액 {new Intl.NumberFormat('ko-KR').format(m.total_points ?? 0)}p
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-xl border-[#E6AF2E]/30 bg-transparent text-xs text-[#F3E5AB] group-hover:bg-[#E6AF2E]/10"
                  >
                    <Zap className="size-3.5 mr-1 text-[#E6AF2E]" />
                    포인트 처리
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Connected Point Action Drawer */}
      <PointActionDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        member={selectedMember}
        onSuccess={(result) => {
          if (selectedMember) {
            setSelectedMember((prev) =>
              prev ? { ...prev, total_points: result.newBalance } : null
            )
          }
        }}
      />
    </div>
  )
}
