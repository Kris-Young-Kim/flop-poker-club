export type UserRole = 'user' | 'staff' | 'super_admin'
export type UserTier = 'NORMAL' | 'VIP' | 'VVIP' | 'ROYAL'

export type PointReason =
  | 'FOUR_OF_A_KIND'       // 투핸드 포카드 승리 (+500P 등)
  | 'STRAIGHT_FLUSH'       // 스티플 승리 (+1,000P 등)
  | 'ROYAL_FLUSH'          // 로티플 승리 (+3,000P 등)
  | 'TOURNAMENT_WIN'       // 토너먼트 우승/입상
  | 'TOURNAMENT_BUYIN'     // 토너먼트 참가 포인트 차감 (-)
  | 'EVENT_BONUS'          // 현금 10장 구매 이벤트 / 신규가입 보너스
  | 'ADMIN_ADJUSTMENT'     // 관리자 수동 지급/차감
  | 'POINT_SHOP_USAGE'     // 매장 내 포인트 사용 (-)

export type TourneyStatus =
  | 'UPCOMING'
  | 'REGISTRATION'
  | 'LIVE'
  | 'COMPLETED'
  | 'CANCELLED'

export type NoticeCategory = 'NOTICE' | 'EVENT' | 'RULE'

export interface Profile {
  id: string
  email: string
  name: string
  nickname: string
  phone: string
  role: UserRole
  tier: UserTier
  qr_token: string
  total_points: number
  created_at: string
  updated_at: string
}

export interface PointTransaction {
  id: string
  user_id: string
  amount: number
  balance_after: number
  reason: PointReason
  description?: string | null
  processed_by: string
  created_at: string
}

export interface Tournament {
  id: string
  title: string
  description?: string | null
  start_time: string
  entry_point_cost: number
  total_prize_points: number
  max_players: number
  status: TourneyStatus
  current_players?: number
  created_at: string
}

export interface TournamentParticipant {
  id: string
  tournament_id: string
  user_id: string
  final_rank?: number | null
  prize_points_awarded?: number
  registered_at: string
  tournament?: Tournament
}

export interface NoticeEvent {
  id: string
  category: NoticeCategory
  title: string
  content: string
  image_url?: string | null
  is_pinned: boolean
  author_id: string
  created_at: string
}
