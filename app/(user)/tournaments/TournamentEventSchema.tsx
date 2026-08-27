import type { Tournament } from '@/types/database.types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://flop-poker-club.vercel.app'

interface Props {
  tournaments: Tournament[]
}

export function TournamentEventSchema({ tournaments }: Props) {
  const active = tournaments.filter(
    (t) => t.status === 'REGISTRATION' || t.status === 'UPCOMING' || t.status === 'LIVE'
  )
  if (active.length === 0) return null

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: active.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@context': 'https://schema.org',
        '@type': 'SportsEvent',
        name: t.title,
        description: t.description ?? 'FLOP 포커클럽 원주 홀덤 토너먼트',
        startDate: t.start_time,
        url: SITE_URL + '/tournaments',
        location: {
          '@type': 'Place',
          name: 'FLOP POKER CLUB 원주',
          address: {
            '@type': 'PostalAddress',
            streetAddress: '서원대로 172, 3층',
            addressLocality: '원주시',
            addressRegion: '강원특별자치도',
            addressCountry: 'KR',
          },
        },
        organizer: { '@type': 'Organization', name: 'FLOP POKER CLUB' },
        offers: {
          '@type': 'Offer',
          price: String(t.entry_point_cost),
          priceCurrency: 'KRW',
          availability:
            t.current_players != null && t.current_players >= t.max_players
              ? 'https://schema.org/SoldOut'
              : 'https://schema.org/InStock',
        },
      },
    })),
  }

  // eslint-disable-next-line react/no-danger -- 정적 서버 데이터, XSS 위험 없음 (Next.js 공식 JSON-LD 패턴)
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}
