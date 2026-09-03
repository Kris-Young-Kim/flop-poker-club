'use client'

import { useState, useEffect } from 'react'
import { Users, Search, Zap, ShieldCheck, ShieldAlert, User, Shield, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PointActionDrawer } from '@/components/forms/PointActionDrawer'
import { Profile, UserRole } from '@/types/database.types'
import { formatDateTime } from '@/lib/utils/format'
import { getAdminMembers, updateMemberRole } from '@/lib/actions/admin'

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Profile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null)

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

  const handleToggleRole = async (member: Profile) => {
    if (member.role === 'super_admin') {
      alert('최고관리자 권한은 변경할 수 없습니다.')
      return
    }

    const nextRole: UserRole = member.role === 'staff' ? 'user' : 'staff'
    const confirmMsg =
      nextRole === 'staff'
        ? `'${member.name || member.nickname}' 님을 [현장 관리자(스태프)]로 지정하시겠습니까?\n\n지정 시 회원의 QR 코드를 스캔하여 포인트를 직접 지급/차감할 수 있는 권한이 부여됩니다.`
        : `'${member.name || member.nickname}' 님의 관리자 권한을 해제하여 [일반회원]으로 변경하시겠습니까?`

    if (!confirm(confirmMsg)) return

    setUpdatingRoleId(member.id)
    try {
      const res = await updateMemberRole({
        targetUserId: member.id,
        newRole: nextRole,
      })

      if (res.success) {
        setMembers((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, role: nextRole } : m))
        )
      } else {
        alert(res.error || '권한 변경에 실패했습니다.')
      }
    } catch (e) {
      console.error(e)
      alert('오류가 발생했습니다.')
    } finally {
      setUpdatingRoleId(null)
    }
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="size-5 text-[#E6AF2E]" />
            <h1 className="font-serif text-xl font-bold tracking-tight text-white">
              회원 및 관리자 권한 관리
            </h1>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            지정된 관리자(스태프)만 QR 스캔으로 포인트를 지급할 수 있습니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-[#181A26] border border-[#E6AF2E]/30 text-[#F5D061] text-xs px-3 py-1 shrink-0">
            총 <strong>{members.length}명</strong>
          </Badge>
          <Badge className="bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs px-2.5 py-1 shrink-0">
            관리자 {members.filter((m) => m.role === 'staff' || m.role === 'super_admin').length}명
          </Badge>
        </div>
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
          filteredMembers.map((member) => {
            const isUpdating = updatingRoleId === member.id
            const isStaff = member.role === 'staff'
            const isSuperAdmin = member.role === 'super_admin'

            return (
              <div
                key={member.id}
                className="rounded-2xl border border-[#E6AF2E]/20 bg-gradient-to-br from-[#181A26] to-[#12131A] p-4 shadow-lg hover:border-[#E6AF2E]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
              >
                {/* Left: Member Info & Role Badge */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl font-black text-base shadow ${
                    isSuperAdmin
                      ? 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 text-black shadow-yellow-500/20'
                      : isStaff
                      ? 'bg-gradient-to-br from-emerald-400 to-teal-600 text-black shadow-emerald-500/20'
                      : 'bg-gradient-to-br from-[#242738] to-[#161722] text-[#9CA3AF] border border-white/10'
                  }`}>
                    {isSuperAdmin ? '👑' : isStaff ? '🛡️' : '♠'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white truncate">
                        {member.name}
                      </span>
                      <span className="text-xs text-[#9CA3AF] shrink-0">
                        @{member.nickname}
                      </span>
                      {isSuperAdmin && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-amber-500/20 text-[#F5D061] border border-amber-500/30">
                          최고관리자
                        </span>
                      )}
                      {isStaff && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          현장관리자 (QR권한)
                        </span>
                      )}
                      {!isStaff && !isSuperAdmin && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium bg-white/5 text-[#9CA3AF] border border-white/10">
                          일반회원
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#9CA3AF] font-mono mt-0.5">
                      <span>{member.phone || '연락처 미등록'}</span>
                      <span>·</span>
                      <span>가입 {formatDateTime(member.created_at, 'date')}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Balance, Role Assignment Toggle & Point Button */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E6AF2E]/10">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] text-[#9CA3AF]">포인트 잔액</p>
                    <p className="font-mono text-base font-black text-[#F5D061]">
                      {new Intl.NumberFormat('ko-KR').format(member.total_points)}p
                    </p>
                  </div>

                  {/* Role Designation Toggle Button */}
                  {!isSuperAdmin && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleRole(member)}
                      disabled={isUpdating}
                      className={`h-9 px-2.5 rounded-xl text-xs font-bold transition-all ${
                        isStaff
                          ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-500/40'
                          : 'border-white/10 bg-[#161824] text-[#9CA3AF] hover:text-[#F5D061] hover:border-[#E6AF2E]/40'
                      }`}
                      title={isStaff ? '관리자 권한 해제' : '관리자(QR포인트지급) 지정'}
                    >
                      {isUpdating ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : isStaff ? (
                        <>
                          <ShieldCheck className="size-3.5 mr-1 text-emerald-400" />
                          관리자 해제
                        </>
                      ) : (
                        <>
                          <Shield className="size-3.5 mr-1" />
                          관리자 지정
                        </>
                      )}
                    </Button>
                  )}

                  {/* Point Button */}
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
            )
          })
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

