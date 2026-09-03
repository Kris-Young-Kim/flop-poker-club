import { CompactClubHome } from '@/components/compact/CompactClubHome'
import { getTournaments } from '@/lib/actions/tournaments'
import { getNotices } from '@/lib/actions/notices'

export default async function UserHomePage() {
  const [notices, tournaments] = await Promise.all([
    getNotices().catch(() => []),
    getTournaments().catch(() => []),
  ])
  const pinnedNotice = notices.find((n) => n.is_pinned) ?? notices[0] ?? null

  return <CompactClubHome initialTournaments={tournaments} initialNotice={pinnedNotice} />
}
