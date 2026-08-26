'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Filter,
  Crown,
  ShieldCheck,
  Zap,
  Edit,
  ReceiptText,
  Phone,
  Calendar,
  CheckCircle2,
  Lock,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { PointActionDrawer } from '@/components/forms/PointActionDrawer'
import { Profile, UserTier } from '@/types/database.types'
import { formatPoints, formatDateTime, getTierMeta } from '@/lib/utils/format'
import { getAdminMembers, updateMemberTier } from '@/lib/actions/admin'

const fallbackMembers: Profile[] = [
  {
    id: 'usr-1',
    email: 'minjun.kim@gmail.com',
    name: '김민준',
    nickname: 'AceKing',
    phone: '010-8888-9999',
    role: 'user',
    tier: 'VIP',
    qr_token: 'flp-99a8-7b2c-8841-f09c',
    total_points: 24500,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
  },
  {
    id: 'usr-2',
    email: 'seoyun.lee@gmail.com',
    name: '이서윤',
    nickname: 'QueenSpade',
    phone: '010-7777-1111',
    role: 'user',
    tier: 'ROYAL',
    qr_token: 'flp-royal-8811-2244',
    total_points: 128400,
    created_at: '2023-11-05T14:30:00Z',
    updated_at: '2024-01-22T18:00:00Z',
  },
  {
    id: 'usr-3',
    email: 'junhyuk.park@gmail.com',
    name: '박준혁',
    nickname: 'MonsterPot',
    phone: '010-3333-5555',
    role: 'user',
    tier: 'VVIP',
    qr_token: 'flp-vvip-3333-5555',
    total_points: 76000,
    created_at: '2023-12-01T09:15:00Z',
    updated_at: '2024-01-23T11:45:00Z',
  },
  {
    id: 'usr-4',
    email: 'taeyang.choi@gmail.com',
    name: '최태양',
    nickname: 'AllInKing',
    phone: '010-1234-5678',
    role: 'user',
    tier: 'NORMAL',
    qr_token: 'flp-norm-1234-5678',
    total_points: 15000,
    created_at: '2024-01-18T16:00:00Z',
    updated_at: '2024-01-18T16:00:00Z',
  },
  {
    id: 'usr-5',
    email: 'jiwoo.jung@gmail.com',
    name: '정지우',
    nickname: 'RiverRat',
    phone: '010-4444-2222',
    role: 'user',
    tier: 'NORMAL',
    qr_token: 'flp-norm-4444-2222',
    total_points: 5000,
    created_at: '2024-01-24T20:00:00Z',
    updated_at: '2024-01-24T20:00:00Z',
  },
]

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Profile[]>(fallbackMembers)
  const [searchQuery, setSearchQuery] = useState('')
  const [tierFilter, setTierFilter] = useState<string>('ALL')
  const [isLoading, setIsLoading] = useState(false)

  // Selected member for Point Drawer or Tier Edit Modal
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null)
  const [pointDrawerOpen, setPointDrawerOpen] = useState(false)
  const [tierModalOpen, setTierModalOpen] = useState(false)
  const [selectedTier, setSelectedTier] = useState<UserTier>('NORMAL')

  const fetchMembers = async () => {
    setIsLoading(true)
    try {
      const data = await getAdminMembers({ search: searchQuery, tier: tierFilter })
      if (data && data.length > 0) {
        setMembers(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [tierFilter])

  // Filtered members list fallback
  const filteredMembers = members.filter((m) => {
    if (tierFilter !== 'ALL' && m.tier !== tierFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        (m.name || '').toLowerCase().includes(q) ||
        (m.nickname || '').toLowerCase().includes(q) ||
        (m.phone || '').includes(q) ||
        (m.email || '').toLowerCase().includes(q)
      )
    }
    return true
  })

  const handleOpenPointDrawer = (member: Profile) => {
    setSelectedMember(member)
    setPointDrawerOpen(true)
  }

  const handleOpenTierModal = (member: Profile) => {
    setSelectedMember(member)
    setSelectedTier(member.tier)
    setTierModalOpen(true)
  }

  const handleSaveTier = async () => {
    if (!selectedMember) return
    try {
      const res = await updateMemberTier({ targetUserId: selectedMember.id, newTier: selectedTier })
      if (!res.success) {
        alert(res.error || '등급 변경에 실패했습니다.')
        return
      }
      setMembers((prev) =>
        prev.map((m) => (m.id === selectedMember.id ? { ...m, tier: selectedTier } : m))
      )
      setTierModalOpen(false)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      alert(msg || '오류가 발생했습니다.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="size-5 text-[#E6AF2E]" />
            <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
              회원 관리 및 등급 설정
            </h1>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            등록된 회원을 검색하고 등급 변경 및 수동 포인트 조정을 처리합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-[#181A26] border border-[#E6AF2E]/30 text-[#F5D061] text-xs px-3 py-1">
            총 등록 회원: <strong>{members.length}명</strong>
          </Badge>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3 rounded-3xl border border-[#E6AF2E]/25 bg-[#13141C] p-4 sm:p-5 shadow-xl">
        <div className="grid sm:grid-cols-[1fr_auto] gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 size-4 text-[#9CA3AF]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="이름, 닉네임, 휴대폰 번호 검색..."
              className="h-10 rounded-xl border-[#E6AF2E]/30 bg-[#181A26] pl-10 text-xs text-white placeholder:text-[#9CA3AF] focus-visible:border-[#E6AF2E]"
            />
          </div>

          {/* Tier Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['ALL', 'NORMAL', 'VIP', 'VVIP', 'ROYAL'].map((t) => (
              <Button
                key={t}
                size="sm"
                variant={tierFilter === t ? 'default' : 'outline'}
                onClick={() => setTierFilter(t)}
                className={`h-9 rounded-xl text-[11px] px-3 font-semibold ${
                  tierFilter === t
                    ? 'bg-[#E6AF2E] text-black font-bold'
                    : 'border-[#E6AF2E]/20 bg-[#181A26] text-[#9CA3AF]'
                }`}
              >
                {t === 'ALL' ? '전체 등급' : t}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Member Cards Table/List */}
      <div className="space-y-3">
        {filteredMembers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#E6AF2E]/20 bg-[#13141C]/50 p-12 text-center">
            <Users className="mx-auto size-12 text-[#9CA3AF]/40" />
            <p className="mt-3 text-sm font-semibold text-white">
              일치하는 회원이 없습니다.
            </p>
          </div>
        ) : (
          filteredMembers.map((member) => {
            const tierMeta = getTierMeta(member.tier)

            return (
              <div
                key={member.id}
                className="rounded-2xl border border-[#E6AF2E]/20 bg-gradient-to-br from-[#181A26] to-[#12131A] p-4 sm:p-5 shadow-lg hover:border-[#E6AF2E]/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Left: Member Info */}
                <div className="flex items-center gap-3.5">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F5D061] to-[#C28B1E] text-black font-black text-lg shadow">
                    ♠
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base text-white">
                        {member.name}
                      </span>
                      <span className="text-xs text-[#9CA3AF]">
                        (@{member.nickname})
                      </span>
                      <Badge className={`${tierMeta.badgeClass} text-[10px] px-2 py-0.5`}>
                        <Crown className="size-3 mr-1 inline" />
                        {member.tier}
                      </Badge>
                    </div>

                    <div className="mt-1 flex items-center gap-3 text-xs text-[#9CA3AF] flex-wrap font-mono">
                      <span>{member.phone}</span>
                      <span>•</span>
                      <span>가입: {formatDateTime(member.created_at, 'date')}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Balance & Action Buttons */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#E6AF2E]/15">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">보유 포인트</p>
                    <p className="font-serif text-lg sm:text-xl font-black text-[#F5D061] mt-0.5">
                      {formatPoints(member.total_points)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenTierModal(member)}
                      className="h-9 px-3 rounded-xl border-[#E6AF2E]/30 bg-[#14151E] text-xs text-[#F3E5AB] hover:bg-[#E6AF2E]/10"
                    >
                      <Crown className="size-3.5 mr-1 text-[#E6AF2E]" />
                      등급 변경
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleOpenPointDrawer(member)}
                      className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-[#F5D061] via-[#E6AF2E] to-[#C28B1E] text-black font-bold text-xs shadow-md"
                    >
                      <Zap className="size-3.5 mr-1" />
                      포인트 지급/조정
                    </Button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Tier Change Modal */}
      <Dialog open={tierModalOpen} onOpenChange={setTierModalOpen}>
        <DialogContent className="max-w-sm border-[#E6AF2E]/30 bg-[#13141C] text-white p-6 rounded-2xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Crown className="size-5 text-[#E6AF2E]" />
              회원 등급 변경
            </DialogTitle>
            <DialogDescription className="text-xs text-[#9CA3AF]">
              {selectedMember?.name} 회원의 VIP 등급을 조정합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 my-3">
            {(['NORMAL', 'VIP', 'VVIP', 'ROYAL'] as UserTier[]).map((tierOption) => {
              const meta = getTierMeta(tierOption)
              return (
                <button
                  key={tierOption}
                  onClick={() => setSelectedTier(tierOption)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                    selectedTier === tierOption
                      ? 'border-[#E6AF2E] bg-[#E6AF2E]/15 shadow-md'
                      : 'border-[#E6AF2E]/15 bg-[#181A26] hover:bg-[#1C1E2D]'
                  }`}
                >
                  <span className="text-sm font-bold text-white">{tierOption}</span>
                  <Badge className={`${meta.badgeClass} text-[10px]`}>
                    {meta.label}
                  </Badge>
                </button>
              )
            })}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setTierModalOpen(false)}
              className="flex-1 border-[#E6AF2E]/30 bg-transparent text-white"
            >
              취소
            </Button>
            <Button
              onClick={handleSaveTier}
              className="flex-1 bg-[#E6AF2E] text-black font-bold hover:bg-[#F5D061]"
            >
              저장 완료
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Connected Point Action Drawer */}
      <PointActionDrawer
        isOpen={pointDrawerOpen}
        onClose={() => setPointDrawerOpen(false)}
        member={selectedMember}
        onSuccess={(res) => {
          if (selectedMember) {
            setMembers((prev) =>
              prev.map((m) =>
                m.id === selectedMember.id ? { ...m, total_points: res.newBalance } : m
              )
            )
          }
        }}
      />
    </div>
  )
}
