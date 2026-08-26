import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FLOP POKER CLUB — VIP Lounge',
    short_name: 'FLOP CLUB',
    description: '원주 최고급 홀덤 클럽 VIP 멤버십 포인트 원장 & QR 출입 인증',
    start_url: '/',
    display: 'standalone',
    background_color: '#08090D',
    theme_color: '#08090D',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: '내 QR 코드',
        short_name: 'QR 코드',
        description: '매장 출입 및 핸드 보너스 적립용 QR',
        url: '/',
        icons: [{ src: '/icon.svg', sizes: '192x192' }],
      },
      {
        name: '포인트 원장',
        short_name: '원장 조회',
        description: '보유 포인트 및 적립/차감 내역',
        url: '/ledger',
        icons: [{ src: '/icon.svg', sizes: '192x192' }],
      },
      {
        name: '토너먼트 일정',
        short_name: '토너먼트',
        description: '대회 일정 및 참가 신청',
        url: '/tournaments',
        icons: [{ src: '/icon.svg', sizes: '192x192' }],
      },
      {
        name: '직원 QR 스캐너',
        short_name: '스캐너',
        description: '직원용 카메라 스캐너 콘솔',
        url: '/admin/scanner',
        icons: [{ src: '/icon.svg', sizes: '192x192' }],
      },
    ],
    categories: ['entertainment', 'lifestyle', 'utilities'],
  }
}
