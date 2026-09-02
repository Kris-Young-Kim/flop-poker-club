import { LandingPage } from '@/components/landing/LandingPage'
import { getTournaments } from '@/lib/actions/tournaments'
import { getNotices } from '@/lib/actions/notices'

export default async function UserHomePage() {
  const [notices, tournaments] = await Promise.all([
    getNotices().catch(() => []),
    getTournaments().catch(() => []),
  ])
  const pinnedNotice = notices.find((n) => n.is_pinned) ?? notices[0] ?? null

  // 모든 사용자(비로그인/로그인)가 첫 접속 시 초호화 럭셔리 랜딩페이지를 만나게 됩니다!
  return <LandingPage tournaments={tournaments} pinnedNotice={pinnedNotice} />
}
