import { Analytics } from '@vercel/analytics/next'
import { Geist, Geist_Mono, Noto_Sans_KR, Playfair_Display } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
const notoSansKr = Noto_Sans_KR({ subsets: ['latin'], variable: '--font-noto-kr' })

export const metadata: Metadata = {
  title: 'FLOP Poker Club | Members Lounge',
  description: 'FLOP 포커 클럽 멤버십 대시보드',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#211f1a',
  userScalable: false,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko" className="bg-background"><body className={`${geist.variable} ${geistMono.variable} ${playfair.variable} ${notoSansKr.variable} antialiased`}>{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
