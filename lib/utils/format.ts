import { PointReason, UserTier, TourneyStatus } from '@/types/database.types'

/**
 * 포인트를 '24,500 P' 형식으로 포맷팅합니다.
 */
export function formatPoints(points: number, showSign: boolean = false): string {
  const formatted = new Intl.NumberFormat('ko-KR').format(Math.abs(points))
  if (showSign && points > 0) {
    return `+${formatted} P`
  }
  if (showSign && points < 0) {
    return `-${formatted} P`
  }
  return `${formatted} P`
}

/**
 * 전화번호를 '010-1234-5678' 형식으로 포맷팅합니다.
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '')
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  }
  return phone
}

/**
 * 날짜와 시간을 한국어 친화적으로 포맷팅합니다.
 */
export function formatDateTime(dateStr: string, format: 'full' | 'short' | 'time' | 'date' = 'short'): string {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  switch (format) {
    case 'full':
      return `${year}. ${month}. ${day} ${hours}:${minutes}`
    case 'date':
      return `${year}. ${month}. ${day}`
    case 'time':
      return `${hours}:${minutes}`
    case 'short':
    default:
      return `${month}.${day} ${hours}:${minutes}`
  }
}

/**
 * 포인트 트랜잭션 사유별 한국어 라벨 및 배지 스타일
 */
export function getPointReasonMeta(reason: PointReason): {
  label: string
  shortLabel: string
  badgeVariant: 'emerald' | 'amber' | 'rose' | 'purple' | 'blue' | 'default'
  isPositive: boolean
} {
  switch (reason) {
    case 'FOUR_OF_A_KIND':
      return { label: '투핸드 포카드 승리', shortLabel: '포카드', badgeVariant: 'emerald', isPositive: true }
    case 'STRAIGHT_FLUSH':
      return { label: '스트레이트 플러시 승리', shortLabel: '스티플', badgeVariant: 'purple', isPositive: true }
    case 'ROYAL_FLUSH':
      return { label: '로열 스트레이트 플러시 승리', shortLabel: '로티플', badgeVariant: 'amber', isPositive: true }
    case 'TOURNAMENT_WIN':
      return { label: '토너먼트 우승/입상', shortLabel: '토너먼트', badgeVariant: 'amber', isPositive: true }
    case 'TOURNAMENT_BUYIN':
      return { label: '토너먼트 참가 신청', shortLabel: '대회참가', badgeVariant: 'rose', isPositive: false }
    case 'EVENT_BONUS':
      return { label: '이벤트 / 신규가입 보너스', shortLabel: '이벤트', badgeVariant: 'blue', isPositive: true }
    case 'ADMIN_ADJUSTMENT':
      return { label: '관리자 수동 조정', shortLabel: '관리자', badgeVariant: 'default', isPositive: true }
    case 'POINT_SHOP_USAGE':
      return { label: '매장 내 포인트 사용', shortLabel: '포인트사용', badgeVariant: 'rose', isPositive: false }
    default:
      return { label: '기타 포인트 변동', shortLabel: '기타', badgeVariant: 'default', isPositive: true }
  }
}

/**
 * 토너먼트 상태별 라벨 및 색상
 */
export function getTourneyStatusMeta(status: TourneyStatus): {
  label: string
  colorClass: string
  bgClass: string
} {
  switch (status) {
    case 'LIVE':
      return { label: '진행중 (LIVE)', colorClass: 'text-red-400', bgClass: 'bg-red-500/15 border-red-500/30' }
    case 'REGISTRATION':
      return { label: '접수중', colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500/15 border-emerald-500/30' }
    case 'UPCOMING':
      return { label: '예정', colorClass: 'text-amber-400', bgClass: 'bg-amber-500/15 border-amber-500/30' }
    case 'COMPLETED':
      return { label: '종료', colorClass: 'text-muted-foreground', bgClass: 'bg-muted/40 border-border' }
    case 'CANCELLED':
      return { label: '취소', colorClass: 'text-rose-400', bgClass: 'bg-rose-500/15 border-rose-500/30' }
  }
}

/**
 * 회원 등급별 스타일 메타
 */
export function getTierMeta(tier: UserTier): {
  label: string
  badgeClass: string
  cardGradient: string
} {
  switch (tier) {
    case 'ROYAL':
      return {
        label: 'ROYAL VIP',
        badgeClass: 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-600 text-black font-bold border-yellow-300/40 shadow-lg shadow-yellow-500/20',
        cardGradient: 'from-[#2a1e06] via-[#1c160c] to-[#0d0c0a]',
      }
    case 'VVIP':
      return {
        label: 'VVIP',
        badgeClass: 'bg-gradient-to-r from-purple-400 to-pink-500 text-white font-bold border-purple-400/40',
        cardGradient: 'from-[#1e132c] via-[#14121d] to-[#0c0b11]',
      }
    case 'VIP':
      return {
        label: 'VIP',
        badgeClass: 'bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold border-amber-400/40',
        cardGradient: 'from-[#231b0e] via-[#171410] to-[#0d0d0f]',
      }
    case 'NORMAL':
    default:
      return {
        label: 'NORMAL',
        badgeClass: 'bg-secondary text-secondary-foreground border-border',
        cardGradient: 'from-[#181924] via-[#13141c] to-[#0b0b0f]',
      }
  }
}
