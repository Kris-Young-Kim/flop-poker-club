import { Analytics } from '@vercel/analytics/next'
import { Geist, Geist_Mono, Noto_Sans_KR, Playfair_Display } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import { Providers } from './providers'
import { BUSINESS_INFO } from '@/lib/constants/business'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
const notoSansKr = Noto_Sans_KR({ subsets: ['latin'], variable: '--font-noto-kr' })

import { PwaInstallPrompt } from '@/components/pwa/PwaInstallPrompt'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://flop-poker-club.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'FLOP POKER CLUB | 원주 No.1 홀덤 포커 VIP 멤버십',
    template: '%s | FLOP POKER CLUB',
  },
  description:
    '강원 원주 최고급 홀덤 포커 클럽. 투명한 포인트 원장, QR 출입 인증, 데일리 & 빅 토너먼트. 신규 가입 즉시 5,000P 웰컴 보너스.',
  keywords: ['원주 포커클럽', '원주 홀덤', '홀덤 포커', 'FLOP', '포커 토너먼트', 'VIP 멤버십', '원주 카드게임'],
  authors: [{ name: '플랍(FLOP)', url: SITE_URL }],
  creator: '플랍(FLOP)',
  publisher: '플랍(FLOP)',
  manifest: '/manifest.webmanifest',
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: SITE_URL,
    siteName: 'FLOP POKER CLUB',
    title: 'FLOP POKER CLUB | 원주 No.1 홀덤 포커 VIP 멤버십',
    description:
      '강원 원주 최고급 홀덤 포커 클럽. 투명한 포인트 원장, QR 출입 인증, 데일리 & 빅 토너먼트. 신규 가입 즉시 5,000P 웰컴 보너스.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FLOP POKER CLUB | 원주 홀덤 포커 VIP 멤버십',
    description: '강원 원주 최고급 홀덤 포커 클럽. 신규 가입 즉시 5,000P 웰컴 보너스.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FLOP CLUB',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#08090D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

// 정적 상수만 사용하므로 XSS 위험 없음 (Next.js 공식 JSON-LD 패턴)
const localBusinessJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'EntertainmentBusiness',
  '@id': `${SITE_URL}#business`,
  name: BUSINESS_INFO.brandName,
  alternateName: BUSINESS_INFO.companyName,
  description:
    '강원 원주 최고급 홀덤 포커 마인드 스포츠 클럽. 투명한 포인트 원장, QR 출입 인증, 데일리 & 빅 토너먼트.',
  url: SITE_URL,
  address: {
    '@type': 'PostalAddress',
    streetAddress: '서원대로 172, 3층',
    addressLocality: '원주시',
    addressRegion: '강원특별자치도',
    addressCountry: 'KR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 37.3417,
    longitude: 127.9201,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '18:00',
      closes: '06:00',
    },
  ],
  priceRange: '$$',
  founder: { '@type': 'Person', name: BUSINESS_INFO.representative },
  foundingDate: '2026-07-15',
  areaServed: { '@type': 'City', name: '원주' },
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'VIP 멤버십', value: true },
    { '@type': 'LocationFeatureSpecification', name: '포인트 시스템', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'QR 출입 인증', value: true },
    { '@type': 'LocationFeatureSpecification', name: '토너먼트 운영', value: true },
  ],
})

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="bg-background" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line react/no-danger -- static constant, no XSS risk */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: localBusinessJsonLd }} />
      </head>
      <body
        className={`${geist.variable} ${geistMono.variable} ${playfair.variable} ${notoSansKr.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <PwaInstallPrompt />
        </Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
