'use client'

import { useState, useEffect } from 'react'
import { LandingPage } from '@/components/landing/LandingPage'
import type { Tournament, NoticeEvent } from '@/types/database.types'
import { getTournaments } from '@/lib/actions/tournaments'
import { getNotices } from '@/lib/actions/notices'

export default function DedicatedLandingPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [pinnedNotice, setPinnedNotice] = useState<NoticeEvent | null>(null)

  useEffect(() => {
    Promise.all([
      getNotices().catch(() => []),
      getTournaments().catch(() => []),
    ]).then(([notices, tourneys]) => {
      setPinnedNotice(notices.find((n) => n.is_pinned) ?? notices[0] ?? null)
      setTournaments(tourneys)
    })
  }, [])

  return <LandingPage tournaments={tournaments} pinnedNotice={pinnedNotice} />
}
