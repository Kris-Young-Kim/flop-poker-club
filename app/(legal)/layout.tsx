import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#08090D] text-white selection:bg-[#E6AF2E]/30">
      <header className="sticky top-0 z-10 border-b border-[#E6AF2E]/20 bg-[#08090D]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-[#9CA3AF] hover:text-white transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span className="text-xs font-medium">돌아가기</span>
          </Link>
          <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#F5D061] to-[#C28B1E] text-black font-serif font-black text-sm">
            ♠
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8 pb-16">{children}</main>
    </div>
  )
}
