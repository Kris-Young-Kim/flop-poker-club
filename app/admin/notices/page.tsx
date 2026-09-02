'use client'

import { useState, useEffect } from 'react'
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
  CheckCircle2,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { NoticeEvent, NoticeCategory } from '@/types/database.types'
import { formatDateTime } from '@/lib/utils/format'
import { getNotices } from '@/lib/actions/notices'
import {
  createAdminNotice,
  updateAdminNotice,
  deleteAdminNotice,
} from '@/lib/actions/admin'

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<NoticeEvent[]>([])
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [pendingPinId, setPendingPinId] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  // Form State
  const [category, setCategory] = useState<NoticeCategory>('NOTICE')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isPinned, setIsPinned] = useState(false)

  const fetchNotices = async () => {
    setIsLoading(true)
    try {
      const data = await getNotices()
      setNotices(data || [])
    } catch (e) {
      console.error('Failed to fetch notices:', e)
      setNotices([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotices()
  }, [])

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    try {
      const res = await createAdminNotice({
        category,
        title,
        content,
        imageUrl: imageUrl.trim() || undefined,
        isPinned,
      })

      if (!res.success) {
        alert(res.error || '공지 생성에 실패했습니다.')
        return
      }

      await fetchNotices()
      setCreateModalOpen(false)
      setTitle('')
      setContent('')
      setImageUrl('')
      setIsPinned(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      alert(msg || '오류가 발생했습니다.')
    }
  }

  const handleDeleteNotice = async (id: string) => {
    if (!confirm('해당 공지글을 삭제하시겠습니까?')) return
    setPendingDeleteId(id)
    try {
      const res = await deleteAdminNotice(id)
      if (!res.success) {
        alert(res.error || '삭제에 실패했습니다.')
        return
      }
      setNotices((prev) => prev.filter((n) => n.id !== id))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      alert(msg || '오류가 발생했습니다.')
    } finally {
      setPendingDeleteId(null)
    }
  }

  const handleTogglePin = async (notice: NoticeEvent) => {
    setPendingPinId(notice.id)
    const nextPinned = !notice.is_pinned

    // 1) 즉시 UI 낙관적 반영
    setNotices((prev) =>
      prev.map((n) => (n.id === notice.id ? { ...n, is_pinned: nextPinned } : n))
    )

    try {
      const res = await updateAdminNotice({
        id: notice.id,
        category: notice.category,
        title: notice.title,
        content: notice.content,
        imageUrl: notice.image_url || undefined,
        isPinned: nextPinned,
      })

      if (!res.success) {
        // 실패 시 롤백
        setNotices((prev) =>
          prev.map((n) => (n.id === notice.id ? { ...n, is_pinned: !nextPinned } : n))
        )
        alert(res.error || '핀 상태 변경에 실패했습니다.')
        return
      }

      // 2) 최신 DB 동기화
      await fetchNotices()
    } catch (err: unknown) {
      setNotices((prev) =>
        prev.map((n) => (n.id === notice.id ? { ...n, is_pinned: !nextPinned } : n))
      )
      const msg = err instanceof Error ? err.message : String(err)
      alert(msg || '오류가 발생했습니다.')
    } finally {
      setPendingPinId(null)
    }
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

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchNotices}
            disabled={isLoading}
            className="h-11 px-3.5 rounded-2xl border-[#E6AF2E]/30 bg-[#161824] text-xs font-semibold text-[#F3E5AB] hover:border-[#E6AF2E]"
            title="새로고침"
          >
            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            onClick={() => setCreateModalOpen(true)}
            className="h-11 px-5 rounded-2xl bg-gradient-to-r from-[#F5D061] via-[#E6AF2E] to-[#C28B1E] text-black font-bold text-xs shadow-lg shadow-yellow-500/25 cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <Plus className="size-4 mr-1.5" />
            새 공지/이벤트 작성
          </Button>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { key: 'ALL', label: '전체 보기' },
          { key: 'NOTICE', label: '공지사항' },
          { key: 'EVENT', label: '이벤트' },
          { key: 'RULE', label: '룰북' },
        ].map((cat) => {
          const count =
            cat.key === 'ALL'
              ? notices.length
              : notices.filter((n) => n.category === cat.key).length
          const isSelected = categoryFilter === cat.key

          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setCategoryFilter(cat.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-[#F5D061] to-[#E6AF2E] text-black shadow-md shadow-yellow-500/20 ring-1 ring-[#F5D061]'
                  : 'border border-[#E6AF2E]/20 bg-[#181A26] text-[#9CA3AF] hover:text-[#F3E5AB] hover:bg-[#202334]'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected
                    ? 'bg-black/20 text-black font-extrabold'
                    : 'bg-[#12131A] text-[#9CA3AF]'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Notice List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="rounded-2xl border border-[#E6AF2E]/20 bg-[#12131C] p-10 text-center">
            <RefreshCw className="mx-auto size-8 text-[#9CA3AF]/50 animate-spin" />
            <p className="mt-3 text-sm text-[#9CA3AF]">공지사항을 불러오는 중...</p>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E6AF2E]/20 bg-[#12131C] p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-white">선택된 카테고리에 게시글이 없습니다.</p>
            <p className="text-xs text-[#9CA3AF]">새로운 공지사항이나 이벤트를 등록해보세요.</p>
            <Button
              size="sm"
              onClick={() => setCategoryFilter('ALL')}
              variant="outline"
              className="mt-1 text-xs border-[#E6AF2E]/30 text-[#F5D061] rounded-xl hover:bg-[#E6AF2E]/10"
            >
              전체 보기로 돌아가기
            </Button>
          </div>
        ) : (
          filteredNotices.map((notice) => (
            <Card
              key={notice.id}
              className="rounded-2xl border border-[#E6AF2E]/20 bg-gradient-to-br from-[#181A26] to-[#12131A] p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-[#13141C] border border-[#E6AF2E]/30 text-[#F5D061] text-[10px]">
                    {notice.category === 'NOTICE' ? '공지사항' : notice.category === 'EVENT' ? '이벤트' : '룰북'}
                  </Badge>
                  {notice.is_pinned && (
                    <Badge className="bg-[#E6AF2E] text-black font-bold text-[10px] flex items-center gap-1 shadow-sm shadow-yellow-500/20">
                      <Pin className="size-3 fill-black" /> 필독 고정
                    </Badge>
                  )}
                  <span className="text-[11px] text-[#9CA3AF] flex items-center gap-1" suppressHydrationWarning>
                    <Calendar className="size-3 text-[#E6AF2E]" />
                    {formatDateTime(notice.created_at, 'date')}
                  </span>
                </div>

                <h3 className="font-bold text-base text-white truncate">{notice.title}</h3>
                <p className="text-xs text-[#9CA3AF] line-clamp-2 leading-relaxed">{notice.content}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E6AF2E]/15 w-full sm:w-auto justify-end">
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  disabled={pendingPinId === notice.id}
                  onClick={() => handleTogglePin(notice)}
                  className={`h-8 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    notice.is_pinned
                      ? 'border-[#E6AF2E] text-[#F5D061] bg-[#E6AF2E]/15 hover:bg-[#E6AF2E]/25'
                      : 'border-white/15 bg-[#141624] text-[#9CA3AF] hover:text-[#F3E5AB] hover:border-[#E6AF2E]/40'
                  }`}
                >
                  {pendingPinId === notice.id ? (
                    <Loader2 className="size-3.5 mr-1 animate-spin" />
                  ) : (
                    <Pin className={`size-3.5 mr-1 ${notice.is_pinned ? 'fill-[#F5D061]' : ''}`} />
                  )}
                  {notice.is_pinned ? '고정 해제' : '상단 고정'}
                </Button>

                <Button
                  size="sm"
                  type="button"
                  variant="ghost"
                  disabled={pendingDeleteId === notice.id}
                  onClick={() => handleDeleteNotice(notice.id)}
                  className="h-8 px-2.5 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  title="삭제"
                >
                  {pendingDeleteId === notice.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                </Button>
              </div>
            </Card>
          ))
        )}
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
