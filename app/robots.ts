import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://flop-poker-club.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/tournaments', '/notices', '/privacy', '/terms', '/landing'],
        disallow: [
          '/lounge',
          '/ledger',
          '/onboarding',
          '/login',
          '/admin/',
          '/api/',
        ],
      },
      // AI 학습 크롤러 차단 (검색 인덱싱에는 영향 없음)
      { userAgent: 'GPTBot', disallow: ['/'] },
      { userAgent: 'Google-Extended', disallow: ['/'] },
      { userAgent: 'Bytespider', disallow: ['/'] },
      { userAgent: 'CCBot', disallow: ['/'] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
