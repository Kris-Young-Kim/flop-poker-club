'use client'

import { useState } from 'react'
import { Megaphone, Sparkles, BookOpen, Pin, ChevronRight, Calendar, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { NoticeEvent } from '@/types/database.types'
import { formatDateTime } from '@/lib/utils/format'

interface NoticeCardProps {
  notice: NoticeEvent
}

export function NoticeCard({ notice }: NoticeCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getCategoryMeta = (cat: string) => {
    switch (cat) {
      case 'EVENT':
        return {
          label: '이벤트',
          badgeClass: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/30',
          icon: Sparkles,
        }
      case 'RULE':
        return {
          label: '룰북 & 가이드',
          badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          icon: BookOpen,
        }
      case 'NOTICE':
      default:
        return {
          label: '공지사항',
          badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          icon: Megaphone,
        }
    }
  }

  const meta = getCategoryMeta(notice.category)
  const IconComponent = meta.icon

  return (
    <>
      <Card
        onClick={() => setIsOpen(true)}
        className={`cursor-pointer overflow-hidden border transition-all rounded-2xl bg-gradient-to-br from-[#181A26] to-[#12131A] hover:scale-[1.01] hover:border-[#E6AF2E]/50 ${
          notice.is_pinned
            ? 'border-[#E6AF2E]/40 shadow-lg shadow-yellow-500/10'
            : 'border-[#E6AF2E]/20'
        }`}
      >
        <CardContent className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {notice.is_pinned && (
                <Badge className="bg-gradient-to-r from-[#F5D061] to-[#E6AF2E] text-black font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Pin className="size-3 fill-black" /> 필독
                </Badge>
              )}
              <Badge className={`${meta.badgeClass} text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border`}>
                <IconComponent className="size-3" />
                {meta.label}
              </Badge>
            </div>
            <span className="text-[11px] text-[#9CA3AF] flex items-center gap-1">
              <Calendar className="size-3 text-[#E6AF2E]" />
              {formatDateTime(notice.created_at, 'date')}
            </span>
          </div>

          <div className="my-2.5">
            <h4 className="text-base sm:text-lg font-bold text-white tracking-tight line-clamp-1 hover:text-[#F3E5AB] transition-colors">
              {notice.title}
            </h4>
            <p className="text-xs text-[#9CA3AF] line-clamp-2 mt-1 leading-relaxed">
              {notice.content}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#E6AF2E]/10 text-xs text-[#F5D061]">
            <span className="text-[11px] text-[#9CA3AF]">자세히 읽기</span>
            <ChevronRight className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* Notice Detail Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg border-[#E6AF2E]/30 bg-[#13141C] text-white p-6 rounded-2xl">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-2">
              {notice.is_pinned && (
                <Badge className="bg-gradient-to-r from-[#F5D061] to-[#E6AF2E] text-black font-bold text-[10px]">
                  <Pin className="size-3 fill-black mr-1" /> 필독
                </Badge>
              )}
              <Badge className={`${meta.badgeClass} text-[11px] font-bold border`}>
                {meta.label}
              </Badge>
              <span className="text-xs text-[#9CA3AF] ml-auto">
                {formatDateTime(notice.created_at, 'full')}
              </span>
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-white leading-snug">
              {notice.title}
            </DialogTitle>
          </DialogHeader>

          {notice.image_url && (
            <div className="overflow-hidden rounded-xl border border-[#E6AF2E]/20 my-2">
              <img
                src={notice.image_url}
                alt={notice.title}
                className="w-full max-h-56 object-cover"
              />
            </div>
          )}

          <div className="my-3 max-h-[50vh] overflow-y-auto pr-1 text-sm text-[#F3E5AB]/90 whitespace-pre-line leading-relaxed">
            {notice.content}
          </div>

          <div className="pt-3 border-t border-[#E6AF2E]/20 flex justify-end">
            <Button
              onClick={() => setIsOpen(false)}
              className="bg-[#181A26] border border-[#E6AF2E]/30 text-[#F3E5AB] hover:bg-[#E6AF2E]/10"
            >
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
