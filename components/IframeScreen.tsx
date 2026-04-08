'use client'

import { useEffect, useState } from 'react'
import { PSP_CONFIG, SCENE_CONFIG } from '@/lib/config'

interface IframeScreenProps {
  zoomed?: boolean
  onFadeOutComplete?: () => void
}

const PSP_WIDTH_UNITS = 16.76
const SCREEN_TO_PSP_RATIO = 9.426 / PSP_WIDTH_UNITS
const SCREEN_ASPECT = PSP_CONFIG.screen.width / PSP_CONFIG.screen.height
const FADE_IN_MS = 500
export const IFRAME_FADE_OUT_MS = 220

export default function IframeScreen({ zoomed = false, onFadeOutComplete }: IframeScreenProps) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (zoomed) {
      setMounted(true)
      const raf = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(raf)
    } else if (visible) {
      setVisible(false)
      const t = setTimeout(() => {
        setMounted(false)
        if (onFadeOutComplete) onFadeOutComplete()
      }, IFRAME_FADE_OUT_MS)
      return () => clearTimeout(t)
    }
  }, [zoomed])

  if (!mounted) return null

  const widthVw = SCENE_CONFIG.camera.zoomFill * SCREEN_TO_PSP_RATIO * 100

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: `${widthVw}vw`,
        aspectRatio: `${SCREEN_ASPECT}`,
        transform: 'translate(-50%, -50%)',
        zIndex: 5,
        background: '#000',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        opacity: visible ? 1 : 0,
        transition: `opacity ${visible ? FADE_IN_MS : IFRAME_FADE_OUT_MS}ms ease-out`,
        pointerEvents: visible ? 'auto' : 'none'
      }}
    >
      <iframe
        src={PSP_CONFIG.screen.url}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
      />
    </div>
  )
}