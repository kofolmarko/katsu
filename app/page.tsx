'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback } from 'react'
import LoadingScreen from '@/components/LoadingScreen'

const PSPViewer = dynamic(() => import('@/components/PSPViewer'), { ssr: false })

export default function Home() {
  const [sceneReady, setSceneReady] = useState(false)
  const [entered, setEntered] = useState(false)

  const handleSceneReady = useCallback(() => setSceneReady(true), [])
  const handleEnter = useCallback(() => setEntered(true), [])

  return (
    <main style={{ width: '100vw', height: '100vh' }}>
      <PSPViewer onSceneReady={handleSceneReady} />
      {!entered && (
        <LoadingScreen sceneReady={sceneReady} onEnter={handleEnter} />
      )}
    </main>
  )
}
