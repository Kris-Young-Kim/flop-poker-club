'use client'

import { useState, useEffect } from 'react'
import { LandingPage } from '@/components/landing/LandingPage'
import type { Tournament, NoticeEvent } from '@/types/database.types'
import { getTournaments } from '@/lib/actions/tournaments'
import { getNotices } from '@/lib/actions/notices'

export default function UserHomePage() {
  const [pinnedNotice, setPinnedNotice] = useState<NoticeEvent | null>(null)
  const [tournaments, setTournaments] = useState<Tournament[]>([])

  useEffect(() => {
    Promise.all([
      getNotices().catch(() => []),
      getTournaments().catch(() => []),
    ]).then(([notices, tourneys]) => {
      setPinnedNotice(notices.find((n) => n.is_pinned) ?? notices[0] ?? null)
      setTournaments(tourneys)
    })
  }, [])

  // 모든 사용자(비로그인/로그인)가 첫 접속 시 초호화 럭셔리 랜딩페이지를 만나게 됩니다!
  return <LandingPage tournaments={tournaments} pinnedNotice={pinnedNotice} />
}
