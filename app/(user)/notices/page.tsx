'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Megaphone, Search, Pin } from 'lucide-react'
import { NoticeCard } from '@/components/cards/NoticeCard'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { NoticeEvent } from '@/types/database.types'
import { getNotices } from '@/lib/actions/notices'

function NoticesContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')

  const [notices, setNotices] = useState<NoticeEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>(
    tabParam === 'RULE' || tabParam === 'EVENT' || tabParam === 'NOTICE' ? tabParam : 'ALL'
  )
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    getNotices().then((data) => {
      setNotices(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (tabParam && ['RULE', 'EVENT', 'NOTICE', 'ALL'].includes(tabParam)) {
      setActiveCategory(tabParam)
    }
  }, [tabParam])

  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      if (activeCategory !== 'ALL' && n.category !== activeCategory) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        if (!n.title.toLowerCase().includes(q) && !n.content.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [notices, activeCategory, searchQuery])

  const pinnedNotices = filteredNotices.filter((n) => n.is_pinned)
  const regularNotices = filteredNotices.filter((n) => !n.is_pinned)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="size-5 text-[#E6AF2E]" />
            <h1 className="font-serif text-xl font-bold tracking-tight text-white">
              공지 및 클럽 가이드
            </h1>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            FLOP Poker Club의 최신 공지사항, 프로모션, 공식 룰북입니다.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#13141C] border border-[#E6AF2E]/20 p-1 rounded-2xl h-11">
          {[
            { value: 'ALL', label: '전체' },
            { value: 'NOTICE', label: '공지' },
            { value: 'EVENT', label: '이벤트' },
            { value: 'RULE', label: '룰북' },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-xl text-xs font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#F5D061] data-[state=active]:to-[#E6AF2E] data-[state=active]:text-black"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 size-4 text-[#9CA3AF]" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="공지, 이벤트, 룰북 내용 검색..."
          className="border-[#E6AF2E]/20 bg-[#13141C] pl-10 text-xs h-10 text-white placeholder:text-[#9CA3AF] rounded-xl focus-visible:border-[#E6AF2E]"
        />
      </div>

      {/* Notice List */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="rounded-2xl border border-dashed border-[#E6AF2E]/20 bg-[#13141C]/50 p-8 text-center text-sm text-[#9CA3AF]">
            공지를 불러오는 중...
          </div>
        ) : (
          <>
            {pinnedNotices.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-[#F5D061] font-bold px-1">
                  <Pin className="size-3.5 fill-[#F5D061]" />
                  <span>필독 공지사항</span>
                </div>
                {pinnedNotices.map((notice) => (
                  <NoticeCard key={notice.id} notice={notice} />
                ))}
              </div>
            )}
            {regularNotices.length > 0 && (
              <div className="space-y-3">
                {pinnedNotices.length > 0 && (
                  <div className="text-xs text-[#9CA3AF] font-bold px-1 pt-2">일반 게시글</div>
                )}
                {regularNotices.map((notice) => (
                  <NoticeCard key={notice.id} notice={notice} />
                ))}
              </div>
            )}
            {filteredNotices.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#E6AF2E]/20 bg-[#13141C]/50 p-8 text-center">
                <Megaphone className="mx-auto size-10 text-[#9CA3AF]/40" />
                <p className="mt-2 text-sm font-semibold text-white">
                  검색 조건과 일치하는 공지사항이 없습니다.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function NoticesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#9CA3AF]">소식을 불러오는 중...</div>}>
      <NoticesContent />
    </Suspense>
  )
}
