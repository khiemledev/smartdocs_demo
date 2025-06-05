import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/contexts/language-context'

export const metadata: Metadata = {
  title: 'UIT-AIClub SmartExtract',
  description: 'AI-Powered Document Processing Demo',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
