'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#181A26',
            border: '1px solid rgba(230, 175, 46, 0.3)',
            color: '#F3E5AB',
          },
        }}
        richColors
      />
    </SessionProvider>
  )
}
