import type { Metadata } from 'next'
import { getTournaments, getMyRegistrations } from '@/lib/actions/tournaments'
import { TournamentsClient } from './TournamentsClient'

export const metadata: Metadata = {
  title: '토너먼트 대회 일정',
  description: 'FLOP 포커클럽 원주 정기 토너먼트 일정 및 참가 접수. 데일리 토너먼트 매일 19:00 진행.',
}

export default async function TournamentsPage() {
  const [tournaments, registrations] = await Promise.all([
    getTournaments(),
    getMyRegistrations(),
  ])

  return (
    <TournamentsClient
      initialTournaments={tournaments}
      initialRegisteredIds={registrations.map((r) => r.tournament_id)}
    />
  )
}
