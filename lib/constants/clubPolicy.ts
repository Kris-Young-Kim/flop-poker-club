/**
 * FLOP POKER CLUB 공식 포인트 적립/사용 및 대회 시상 정책
 */

export const CLUB_POINTS_POLICY = {
  /** 신규 가입 */
  NEW_SIGNUP: 500,

  /** 매장 결제 적립 */
  PAYMENT_30K: 100,
  PAYMENT_100K: 400,

  /** 토너먼트 순위 보너스 */
  RANK_1ST: 300,
  RANK_2ND: 200,
  RANK_3RD: 100,
  ONE_BUYIN_WIN_BONUS: 100,

  /** 핸드 족보 달성 보너스 */
  ROYAL_FLUSH: 300,
  STRAIGHT_FLUSH: 200,
  FOUR_OF_A_KIND: 100,

  /** 연속 출석 보너스 */
  ATTENDANCE_10_DAYS: 300,
  ATTENDANCE_20_DAYS: 1000,
  ATTENDANCE_30_DAYS: '대회 시드권 1장',

  /** 포인트 사용 및 교환 */
  SEED_TICKET_COST: 5000,
  REBUYIN_COST: 5000,
} as const

export const TOURNAMENT_PRIZES = [
  { rank: '1등', prize: '동남아 항공숙박권 2인', highlight: true, badge: '우승 혜택', icon: '✈️' },
  { rank: '2등', prize: '강원도 5성 호텔숙박권', highlight: true, badge: '준우승', icon: '🏨' },
  { rank: '3등', prize: '매장이용 10만원권', highlight: false, badge: '3위', icon: '💳' },
  { rank: '4등', prize: '바인권 5장', highlight: false, badge: 'Final Table', icon: '🎟️' },
  { rank: '5등', prize: '바인권 3장', highlight: false, badge: 'Final Table', icon: '🎟️' },
  { rank: '6~10등', prize: '바인권 1장', highlight: false, badge: 'In The Money', icon: '🎟️' },
  { rank: '참가자 전원', prize: '소정의 참가 기념 상품', highlight: false, badge: '참가 보상', icon: '🎁' },
] as const

export const POINT_BENEFIT_SECTIONS = [
  {
    category: '신규 & 결제 적립',
    items: [
      { label: '신규 회원 가입', point: '+500 P', desc: '가입 즉시 웰컴 포인트 지급' },
      { label: '3만 원 결제 시', point: '+100 P', desc: '매장 3만 결제 시 적립' },
      { label: '10만 원 결제 시', point: '+400 P', desc: '매장 10만 결제 시 적립' },
    ],
  },
  {
    category: '토너먼트 순위 보너스',
    items: [
      { label: '대회 1등 (우승)', point: '+300 P', desc: '토너먼트 우승 포인트' },
      { label: '대회 2등 (준우승)', point: '+200 P', desc: '토너먼트 준우승 포인트' },
      { label: '대회 3등', point: '+100 P', desc: '토너먼트 3위 포인트' },
      { label: '원바인 우승 시', point: '+100 P', desc: '리바인 없이 우승 시 추가 지급' },
    ],
  },
  {
    category: '핸드 족보 달성 보너스',
    items: [
      { label: '로티플 (로얄 스트레이트 플러시)', point: '+300 P', desc: '최고 족보 달성 기념' },
      { label: '스티플 (스트레이트 플러시)', point: '+200 P', desc: '스트레이트 플러시 완성' },
      { label: '포카드 (Four of a Kind)', point: '+100 P', desc: '투핸드 포카드 승리' },
    ],
  },
  {
    category: '연속 출석 체크',
    items: [
      { label: '10일 연속 출석', point: '+300 P', desc: '10일 연속 방문 달성' },
      { label: '20일 연속 출석', point: '+1,000 P', desc: '20일 연속 방문 달성' },
      { label: '30일 연속 출석', point: '대회 시드권 1장', desc: '30일 연속 개근 보상' },
    ],
  },
  {
    category: '포인트 사용 및 바인',
    items: [
      { label: '대회 시드권 교환', point: '-5,000 P', desc: '메인 토너먼트 시드권 교환' },
      { label: '리바인 (Re-Buyin)', point: '-5,000 P', desc: '포인트로 리바인 참가' },
    ],
  },
] as const
