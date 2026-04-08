'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, type RefObject } from 'react'
import * as THREE from 'three'
import { PSP_CONFIG } from '@/lib/config'

interface ScreenTrackerProps {
  targetRef: RefObject<HTMLDivElement | null>
}

// World-space width of the PSP screen quad — matches the value used when
// sizing/positioning the screen in lib/config.ts.
const SCREEN_WORLD_WIDTH = 9.426

/**
 * Runs inside the R3F Canvas. Each frame it projects the four world-space
 * corners of the PSP screen rectangle through the current camera, derives the
 * axis-aligned bounding rect in canvas CSS pixels, and writes a
 * translate+scale transform onto the iframe wrapper. This keeps the HTML
 * iframe glued to the 3D PSP screen during camera animations and window
 * resizes — the iframe's native CSS size stays fixed (for a consistent
 * internal resolution) while its on-screen footprint is set purely via
 * transform.
 */
export default function ScreenTracker({ targetRef }: ScreenTrackerProps) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)

  // PSP is rotated so its screen lies flat in the world XZ plane at
  // y = screen.position.y. Width runs along world X, height along world Z.
  const corners = useMemo(() => {
    const sp = PSP_CONFIG.screen.position
    const aspect = PSP_CONFIG.screen.width / PSP_CONFIG.screen.height
    const halfW = SCREEN_WORLD_WIDTH / 2
    const halfH = halfW / aspect
    return [
      new THREE.Vector3(sp.x - halfW, sp.y, sp.z - halfH),
      new THREE.Vector3(sp.x + halfW, sp.y, sp.z - halfH),
      new THREE.Vector3(sp.x + halfW, sp.y, sp.z + halfH),
      new THREE.Vector3(sp.x - halfW, sp.y, sp.z + halfH),
    ]
  }, [])

  const scratch = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const el = targetRef.current
    if (!el) return

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const c of corners) {
      scratch.copy(c).project(camera)
      const px = (scratch.x + 1) * 0.5 * size.width
      const py = (1 - scratch.y) * 0.5 * size.height
      if (px < minX) minX = px
      if (px > maxX) maxX = px
      if (py < minY) minY = py
      if (py > maxY) maxY = py
    }

    const w = maxX - minX
    const h = maxY - minY
    const sx = w / PSP_CONFIG.screen.width
    const sy = h / PSP_CONFIG.screen.height

    el.style.transform = `translate(${minX}px, ${minY}px) scale(${sx}, ${sy})`
  })

  return null
}
