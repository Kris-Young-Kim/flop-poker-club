'use client'

import { useState, useEffect } from 'react'
import { Users, Search, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PointActionDrawer } from '@/components/forms/PointActionDrawer'
import { Profile } from '@/types/database.types'
import { formatDateTime } from '@/lib/utils/format'
import { getAdminMembers } from '@/lib/actions/admin'

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Profile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const [selectedMember, setSelectedMember] = useState<Profile | null>(null)
  const [pointDrawerOpen, setPointDrawerOpen] = useState(false)

  const fetchMembers = async () => {
    setIsLoading(true)
    try {
      const data = await getAdminMembers({ search: searchQuery })
      setMembers(data || [])
    } catch (e) {
      console.error(e)
      setMembers([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const filteredMembers = members.filter((m) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      (m.name || '').toLowerCase().includes(q) ||
      (m.nickname || '').toLowerCase().includes(q) ||
      (m.phone || '').includes(q) ||
      (m.email || '').toLowerCase().includes(q)
    )
  })

  const handleOpenPointDrawer = (member: Profile) => {
    setSelectedMember(member)
    setPointDrawerOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="size-5 text-[#E6AF2E]" />
            <h1 className="font-serif text-xl font-bold tracking-tight text-white">
              회원 관리
            </h1>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            회원 검색 및 포인트 지급·조정
          </p>
        </div>

        <Badge className="bg-[#181A26] border border-[#E6AF2E]/30 text-[#F5D061] text-xs px-3 py-1 shrink-0">
          총 <strong>{members.length}명</strong>
        </Badge>
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl border border-[#E6AF2E]/25 bg-[#13141C] p-3.5 shadow-xl">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 size-4 text-[#9CA3AF]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이름, 닉네임, 휴대폰 번호 검색..."
            className="h-10 rounded-xl border-[#E6AF2E]/30 bg-[#181A26] pl-10 text-xs text-white placeholder:text-[#9CA3AF] focus-visible:border-[#E6AF2E]"
          />
        </div>
      </div>

      {/* Member Cards Table/List */}
      <div className="space-y-2.5">
        {filteredMembers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#E6AF2E]/20 bg-[#13141C]/50 p-12 text-center">
            <Users className="mx-auto size-12 text-[#9CA3AF]/40" />
            <p className="mt-3 text-sm font-semibold text-white">
              일치하는 회원이 없습니다.
            </p>
          </div>
        ) : (
          filteredMembers.map((member) => (
            <div
              key={member.id}
              className="rounded-2xl border border-[#E6AF2E]/20 bg-gradient-to-br from-[#181A26] to-[#12131A] p-3.5 shadow-lg hover:border-[#E6AF2E]/50 transition-all flex items-center justify-between gap-3"
            >
              {/* Left: Member Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5D061] to-[#C28B1E] text-black font-black text-base shadow">
                  ♠
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-white truncate">
                      {member.name}
                    </span>
                    <span className="text-xs text-[#9CA3AF] shrink-0">
                      @{member.nickname}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#9CA3AF] font-mono">
                    <span>{member.phone}</span>
                    <span>·</span>
                    <span>가입 {formatDateTime(member.created_at, 'date')}</span>
                  </div>
                </div>
              </div>

              {/* Right: Balance & Point Button */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-[10px] text-[#9CA3AF]">포인트</p>
                  <p className="font-mono text-base font-black text-[#F5D061]">
                    {new Intl.NumberFormat('ko-KR').format(member.total_points)}p
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleOpenPointDrawer(member)}
                  className="h-9 px-3 rounded-xl bg-gradient-to-r from-[#F5D061] via-[#E6AF2E] to-[#C28B1E] text-black font-bold text-xs shadow-md"
                >
                  <Zap className="size-3.5 mr-1" />
                  포인트
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

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
