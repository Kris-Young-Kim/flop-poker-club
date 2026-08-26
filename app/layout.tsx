import { Analytics } from '@vercel/analytics/next'
import { Geist, Geist_Mono, Noto_Sans_KR, Playfair_Display } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import { Providers } from './providers'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
const notoSansKr = Noto_Sans_KR({ subsets: ['latin'], variable: '--font-noto-kr' })

import { PwaInstallPrompt } from '@/components/pwa/PwaInstallPrompt'

export const metadata: Metadata = {
  title: 'FLOP POKER CLUB | 원주 VIP 멤버십 & 라운지',
  description: 'FLOP 포커 클럽 원주점 멤버십 포인트 원장, QR 출입 인증 및 토너먼트 일정 관리 웹앱',
  manifest: '/manifest.webmanifest',
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
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="bg-background" suppressHydrationWarning>
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
