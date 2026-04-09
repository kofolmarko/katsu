import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'katsu',
  description: 'Interactive 3D model of a Sony PSP with a live embedded screen. Built with React Three Fiber.',
  keywords: ['3D', 'PSP', 'Sony PSP', 'Three.js', 'React Three Fiber', 'interactive'],
  openGraph: {
    title: 'katsu resume',
    description: 'Interactive 3D model of a Sony PSP with a live embedded screen',
    type: 'website',
  },
  icons: '/favicon.png',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
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
