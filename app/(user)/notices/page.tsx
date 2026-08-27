import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getNotices } from '@/lib/actions/notices'
import { NoticesClient } from './NoticesClient'

export const revalidate = 60

export const metadata: Metadata = {
  title: '클럽 공지 & 소식',
  description: 'FLOP 포커클럽 원주의 최신 공지사항, 이벤트, 클럽 소식을 확인하세요.',
}

export default async function NoticesPage() {
  const notices = await getNotices()

  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#9CA3AF]">소식을 불러오는 중...</div>}>
      <NoticesClient initialNotices={notices} />
    </Suspense>
  )
}
