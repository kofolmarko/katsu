import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'katsu',
  description: '3D PSP Model with Interactive Screen',
  icons: '/favicon.png',
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
