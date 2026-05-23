import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Relay Studio — Content Review',
  description: 'Human-in-the-loop content review for Relay agency',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-loopin-bg antialiased">
        {/* Global nav */}
        <header className="border-b border-loopin-border bg-loopin-card/50 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Loopin wordmark */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-loopin-purple flex items-center justify-center">
                  <span className="text-white text-xs font-bold">L</span>
                </div>
                <span className="font-bold text-loopin-text tracking-tight">Relay Studio</span>
              </div>
              <span className="text-loopin-border">|</span>
              <span className="text-sm text-loopin-text-secondary">Content Review</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-loopin-text-secondary">
              <span className="w-2 h-2 rounded-full bg-loopin-teal animate-pulse inline-block" />
              Live
            </div>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
