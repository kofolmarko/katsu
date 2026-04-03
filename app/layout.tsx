import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PSP Viewer',
  description: '3D PSP Model with Interactive Screen',
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
