'use client'

import dynamic from 'next/dynamic'

const PSPViewer = dynamic(() => import('@/components/PSPViewer'), {
  ssr: false,
  loading: () => <div id="loading">Loading 3D Scene...</div>
})

export default function Home() {
  return (
    <main style={{ width: '100vw', height: '100vh' }}>
      <PSPViewer />
    </main>
  )
}
