import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vanta',
  description: 'Spatial viewing for architecture and real estate',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
