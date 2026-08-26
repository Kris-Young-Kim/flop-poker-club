'use client'

import { useState } from 'react'
import {
  Megaphone,
  Plus,
  Sparkles,
  BookOpen,
  Pin,
  Trash2,
  Edit,
  Calendar,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { NoticeEvent, NoticeCategory } from '@/types/database.types'
import { formatDateTime } from '@/lib/utils/format'

const mockAdminNotices: NoticeEvent[] = [
  {
    id: 'not-101',
    category: 'NOTICE',
    title: '♠ FLOP POKER CLUB 원주점 회원가입 및 멤버십 혜택 총정리',
    content: 'FLOP POKER CLUB 원주점에 오신 회원 여러분을 환영합니다. 투핸드 포카드(+500P), 스티플(+1,000P), 로티플(+3,000P) 원터치 포인트 즉시 지급 혜택이 적용 중입니다.',
    is_pinned: true,
    author_id: 'admin-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'not-102',
    category: 'EVENT',
    title: '🔥 신규 멤버십 오픈 기념 웰컴 5,000 P 지급 이벤트',
    content: 'FLOP 클럽 앱 온보딩을 완료하신 모든 신규 회원님께 즉시 사용 가능한 웰컴 5,000 포인트를 증정합니다.',
    is_pinned: false,
    author_id: 'admin-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    id: 'not-103',
    category: 'RULE',
    title: '📜 FLOP POKER CLUB 공식 경기 룰 & 에티켓 가이드',
    content: 'TDA 국제 토너먼트 공식 룰을 엄격히 준수합니다. 원 플레이어 투 핸드 및 스트링 베팅 금지 규정을 숙지해 주세요.',
    is_pinned: true,
    author_id: 'admin-1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
]

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<NoticeEvent[]>(mockAdminNotices)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')

  // Form State
  const [category, setCategory] = useState<NoticeCategory>('NOTICE')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isPinned, setIsPinned] = useState(false)

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    const newNotice: NoticeEvent = {
      id: `not-${Date.now()}`,
      category,
      title,
      content,
      image_url: imageUrl.trim() || null,
      is_pinned: isPinned,
      author_id: 'admin-1',
      created_at: new Date().toISOString(),
    }

    setNotices((prev) => [newNotice, ...prev])
    setCreateModalOpen(false)
    setTitle('')
    setContent('')
    setImageUrl('')
    setIsPinned(false)
  }

  const handleDeleteNotice = (id: string) => {
    if (confirm('해당 공지글을 삭제하시겠습니까?')) {
      setNotices((prev) => prev.filter((n) => n.id !== id))
    }
  }

  const handleTogglePin = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_pinned: !n.is_pinned } : n))
    )
  }

  const filteredNotices = notices.filter((n) => {
    if (categoryFilter !== 'ALL' && n.category !== categoryFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="size-5 text-[#E6AF2E]" />
            <h1 className="font-serif text-2xl font-bold tracking-tight text-white">
              공지사항 및 이벤트 등록
            </h1>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            매장 공지, 이벤트 소식, 룰북을 작성하고 메인 배너에 고정(Pin)합니다.
          </p>
        </div>

        <Button
          onClick={() => setCreateModalOpen(true)}
          className="h-11 px-5 rounded-2xl bg-gradient-to-r from-[#F5D061] via-[#E6AF2E] to-[#C28B1E] text-black font-bold text-xs shadow-lg shadow-yellow-500/25"
        >
          <Plus className="size-4 mr-1.5" />
          새 공지/이벤트 작성
        </Button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'NOTICE', 'EVENT', 'RULE'].map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={categoryFilter === cat ? 'default' : 'outline'}
            onClick={() => setCategoryFilter(cat)}
            className={`h-9 rounded-xl text-xs font-semibold ${
              categoryFilter === cat
                ? 'bg-[#E6AF2E] text-black font-bold'
                : 'border-[#E6AF2E]/20 bg-[#181A26] text-[#9CA3AF]'
            }`}
          >
            {cat === 'ALL' ? '전체 보기' : cat === 'NOTICE' ? '공지사항' : cat === 'EVENT' ? '이벤트' : '룰북'}
          </Button>
        ))}
      </div>

      {/* Notice List */}
      <div className="space-y-3">
        {filteredNotices.map((notice) => (
          <Card
            key={notice.id}
            className="rounded-2xl border border-[#E6AF2E]/20 bg-gradient-to-br from-[#181A26] to-[#12131A] p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-[#13141C] border border-[#E6AF2E]/30 text-[#F5D061] text-[10px]">
                  {notice.category}
                </Badge>
                {notice.is_pinned && (
                  <Badge className="bg-[#E6AF2E] text-black font-bold text-[10px] flex items-center gap-1">
                    <Pin className="size-3 fill-black" /> 필독 고정
                  </Badge>
                )}
                <span className="text-[11px] text-[#9CA3AF] flex items-center gap-1">
                  <Calendar className="size-3 text-[#E6AF2E]" />
                  {formatDateTime(notice.created_at, 'date')}
                </span>
              </div>

              <h3 className="font-bold text-base text-white">{notice.title}</h3>
              <p className="text-xs text-[#9CA3AF] line-clamp-2 leading-relaxed">{notice.content}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E6AF2E]/15 w-full sm:w-auto justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTogglePin(notice.id)}
                className={`h-8 px-2.5 rounded-xl text-xs ${
                  notice.is_pinned
                    ? 'border-[#E6AF2E] text-[#F5D061] bg-[#E6AF2E]/10'
                    : 'border-border text-[#9CA3AF]'
                }`}
              >
                <Pin className="size-3.5 mr-1" />
                {notice.is_pinned ? '고정 해제' : '상단 고정'}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteNotice(notice.id)}
                className="h-8 px-2.5 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Notice Dialog */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-lg border-[#E6AF2E]/30 bg-[#13141C] text-white p-6 rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Megaphone className="size-5 text-[#E6AF2E]" />
              새 공지사항 / 이벤트 등록
            </DialogTitle>
            <DialogDescription className="text-xs text-[#9CA3AF]">
              작성된 글은 사용자 홈 대시보드와 공지 탭에 즉시 게시됩니다.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateNotice} className="space-y-4 my-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#F3E5AB]">카테고리</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'NOTICE', label: '공지사항' },
                  { key: 'EVENT', label: '이벤트' },
                  { key: 'RULE', label: '룰북/가이드' },
                ].map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCategory(c.key as NoticeCategory)}
                    className={`h-10 rounded-xl border text-xs font-bold transition-all ${
                      category === c.key
                        ? 'bg-[#E6AF2E] text-black border-[#E6AF2E]'
                        : 'border-[#E6AF2E]/20 bg-[#181A26] text-[#9CA3AF]'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#F3E5AB]">제목</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="공지 또는 이벤트 제목을 입력하세요"
                className="h-10 rounded-xl border-[#E6AF2E]/30 bg-[#181A26] text-xs text-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#F3E5AB]">내용 (줄바꿈 지원)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                placeholder="상세 내용을 입력하세요..."
                className="w-full rounded-xl border border-[#E6AF2E]/30 bg-[#181A26] p-3 text-xs text-white placeholder:text-[#9CA3AF] focus:border-[#E6AF2E] outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#F3E5AB]">배너 이미지 URL (선택)</label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... 이미지 링크"
                className="h-10 rounded-xl border-[#E6AF2E]/30 bg-[#181A26] text-xs text-white"
              />
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 text-xs text-[#F3E5AB] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="size-4 rounded accent-[#E6AF2E]"
                />
                <span>메인 홈 화면 및 상단 필독 공지로 고정(Pin)</span>
              </label>
            </div>

            <div className="flex gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                className="flex-1 border-[#E6AF2E]/30 bg-transparent text-white text-xs"
              >
                취소
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-[#F5D061] via-[#E6AF2E] to-[#C28B1E] text-black font-bold text-xs"
              >
                게시글 등록
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
