'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { CameraControls, Environment } from '@react-three/drei'
import { EffectComposer, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import PSPModel from './PSPModel'
import IframeScreen, { IFRAME_FADE_MS } from './IframeScreen'
import ScreenTracker from './ScreenTracker'
import Lights from './Lights'
import RoomBox from './RoomBox'
import CoffeeTable from './CoffeeTable'
import Sofa from './Sofa'
import Wardrobe from './Wardrobe'
import CoffeeCup from './CoffeeCup'
import Magazine from './Magazine'
import WallDecor from './WallDecor'
import Bed from './Bed'
import BedShelves from './BedShelves'
import BedDecor from './BedDecor'
import Door from './Door'
import { SCENE_CONFIG, PSP_CONFIG } from '@/lib/config'

// Constrains camera target to stay inside the room walls.
function RoomBoundary({ controlsRef }: { controlsRef: React.RefObject<CameraControls | null> }) {
  useEffect(() => {
    const ctrl = controlsRef.current
    if (!ctrl) return
    // Boundary keeps lookAt target inside room — prevents orbiting behind beds (front at z=+50)
    ctrl.setBoundary(new THREE.Box3(
      new THREE.Vector3(-155, 10, -270),
      new THREE.Vector3(155, 230, 70)
    ))
  }, [])
  return null
}

// Computes the correct zoom camera position so the PSP fills zoomFill of screen width.
// Runs on every resize while zoomed so the view stays correct at any window size.
function DynamicCameraController({
  zoomed,
  controlsRef,
}: {
  zoomed: boolean
  controlsRef: React.RefObject<CameraControls | null>
}) {
  const { size } = useThree()
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const wasZoomed = useRef(false)

  useEffect(() => {
    const ctrl = controlsRef.current
    if (!ctrl) return

    const animate = zoomed !== wasZoomed.current  // animate on state change, snap on resize
    wasZoomed.current = zoomed

    if (zoomed) {
      const aspect = size.width / size.height
      const vFovRad = (camera.fov * Math.PI) / 180
      const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * aspect)

      const pspWorldWidth = 16.76 * PSP_CONFIG.model.scale

      // Use screen position as the target - it's the visual center of the PSP
      const targetX = PSP_CONFIG.screen.position.x
      const targetY = PSP_CONFIG.screen.position.y
      const targetZ = PSP_CONFIG.screen.position.z

      // Calculate distance to fit PSP width in view
      const D = (pspWorldWidth / SCENE_CONFIG.camera.zoomFill) / (2 * Math.tan(hFovRad / 2))

      // Position camera directly above the screen center, looking straight down
      ctrl.setLookAt(targetX, targetY + D, targetZ, targetX, targetY, targetZ, animate)
    } else {
      const [px, py, pz] = SCENE_CONFIG.camera.overview.position
      const [tx, ty, tz] = SCENE_CONFIG.camera.overview.target
      ctrl.setLookAt(px, py, pz, tx, ty, tz, animate)
    }
  }, [zoomed, size.width, size.height])

  return null
}

// Must match CameraControls.smoothTime below — delay iframe reveal until the
// zoom-in animation has visibly settled so the user doesn't see it tracking
// the PSP across the screen.
const CAMERA_SMOOTH_MS = 500

export default function PSPViewer() {
  const [zoomed, setZoomed] = useState(false)
  const [iframeVisible, setIframeVisible] = useState(false)
  const cameraControlsRef = useRef<CameraControls>(null)
  const iframeWrapperRef = useRef<HTMLDivElement>(null)
  const isClampingRef = useRef(false)
  const smoothTimeSet = useRef(false)

  useEffect(() => {
    const ctrl = cameraControlsRef.current
    if (ctrl && !smoothTimeSet.current) {
      ctrl.smoothTime = CAMERA_SMOOTH_MS
      smoothTimeSet.current = true
    }
  }, [])

  // Reveal the iframe only after the zoom-in animation has settled. On
  // zoom-out, handleZoomOut hides it first, so nothing to do here for that
  // direction.
  useEffect(() => {
    if (!zoomed) return
    const t = setTimeout(() => setIframeVisible(true), CAMERA_SMOOTH_MS)
    return () => clearTimeout(t)
  }, [zoomed])

  const handleZoomOut = useCallback(() => {
    // Fade the iframe out first, then start the camera zoom-out so the user
    // doesn't watch the iframe shrink along with the PSP.
    setIframeVisible(false)
    setTimeout(() => setZoomed(false), IFRAME_FADE_MS)
  }, [])

  // Snap back to overview on pointer release
  const handlePointerUp = useCallback(() => {
    if (zoomed) return
    const ctrl = cameraControlsRef.current
    if (!ctrl) return
    const [px, py, pz] = SCENE_CONFIG.camera.overview.position
    const [tx, ty, tz] = SCENE_CONFIG.camera.overview.target
    ctrl.setLookAt(px, py, pz, tx, ty, tz, true)
  }, [zoomed])

  useEffect(() => {
    const handleContextLost = (event: Event) => event.preventDefault()
    const handleContextRestored = () => window.location.reload()

    const timeoutId = setTimeout(() => {
      const canvas = document.querySelector('canvas')
      if (canvas) {
        canvas.addEventListener('webglcontextlost', handleContextLost)
        canvas.addEventListener('webglcontextrestored', handleContextRestored)
      }
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      const canvas = document.querySelector('canvas')
      if (canvas) {
        canvas.removeEventListener('webglcontextlost', handleContextLost)
        canvas.removeEventListener('webglcontextrestored', handleContextRestored)
      }
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        shadows="soft"
        camera={{
          position: SCENE_CONFIG.camera.overview.position,
          fov: SCENE_CONFIG.camera.fov,
          near: SCENE_CONFIG.camera.near,
          far: SCENE_CONFIG.camera.far
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false
        }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault())
        }}
        onPointerUp={handlePointerUp}
        style={{
          background: SCENE_CONFIG.background,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          // Stay interactive in zoomed mode so individual PSP buttons remain
          // clickable. CameraControls is disabled via `enabled={!zoomed}` so
          // orbit/zoom inputs are ignored, and the iframe overlay (z:5)
          // intercepts pointer events on the screen region.
          pointerEvents: 'auto'
        }}
      >
        <Lights />
        <Environment
          files="/hdri/abandoned_tiled_room_4k.exr"
          backgroundIntensity={0}
          environmentIntensity={0.4}
        />

        <RoomBox />
        <Sofa />
        <CoffeeTable />
        <Wardrobe />
        <CoffeeCup />
        <Magazine />
        <WallDecor />
        <Door />
        <Bed side="left" />
        <Bed side="right" />
        <BedShelves side="left" />
        <BedShelves side="right" />
        <BedDecor side="left" />
        <BedDecor side="right" />
        <PSPModel
          onClick={!zoomed ? () => setZoomed(true) : undefined}
          clickable={!zoomed}
          zoomed={zoomed}
        />

        <EffectComposer>
          <Vignette eskil={false} offset={0.05} darkness={0.85} color="#f8f8f8" />
        </EffectComposer>

        <DynamicCameraController
          zoomed={zoomed}
          controlsRef={cameraControlsRef}
        />
        <ScreenTracker targetRef={iframeWrapperRef} />
        <RoomBoundary controlsRef={cameraControlsRef} />

        <CameraControls
          ref={cameraControlsRef}
          enabled={!zoomed}
          makeDefault
          azimuthRotateSpeed={0.35}
          polarRotateSpeed={0.15}
          minAzimuthAngle={-Math.PI / 4}
          maxAzimuthAngle={Math.PI / 4}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={Math.PI / 2.4}
          minDistance={80}
          maxDistance={350}
          onChange={() => {
            if (isClampingRef.current || zoomed) return
            const ctrl = cameraControlsRef.current
            if (!ctrl) return
            const pos = new THREE.Vector3()
            ctrl.getPosition(pos)
            const cx = THREE.MathUtils.clamp(pos.x, -160, 160)
            const cy = THREE.MathUtils.clamp(pos.y, 15, 248)
            const cz = THREE.MathUtils.clamp(pos.z, 60, 290)
            if (Math.abs(pos.x - cx) > 0.5 || Math.abs(pos.y - cy) > 0.5 || Math.abs(pos.z - cz) > 0.5) {
              isClampingRef.current = true
              ctrl.setPosition(cx, cy, cz, false)
              isClampingRef.current = false
            }
          }}
        />
      </Canvas>

      <IframeScreen ref={iframeWrapperRef} visible={iframeVisible} />

      {!zoomed && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 28,
              left: 28,
              zIndex: 10,
              fontSize: 14,
              fontWeight: 600,
              color: '#fff',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            katsu
          </div>

          <div
            style={{
              position: 'absolute',
              top: 28,
              right: 28,
              zIndex: 10,
              fontSize: 12,
              color: '#fff',
              opacity: 0.5,
              letterSpacing: '0.08em',
            }}
          >
            drag to orbit · scroll to zoom
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 28,
              right: 28,
              zIndex: 10,
              fontSize: 11,
              color: '#fff',
              opacity: 0.35,
              letterSpacing: '0.05em',
            }}
          >
            © 2026
          </div>

          <a
            href="https://github.com/kofolmarko"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: 'absolute',
              bottom: 28,
              left: 28,
              zIndex: 10,
              fontSize: 11,
              color: '#fff',
              opacity: 0.35,
              letterSpacing: '0.05em',
              textDecoration: 'none',
            }}
          >
            created by kofolmarko
          </a>

          <button
            onClick={() => setZoomed(true)}
            className="underline-btn"
            style={{
              position: 'absolute',
              bottom: 32,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: '0.04em',
              userSelect: 'none',
              textAlign: 'center',
            }}
          >
            click the PSP to interact
          </button>
        </>
      )}

      {zoomed && (
        <button
          onClick={handleZoomOut}
          className="underline-btn"
          style={{
            position: 'absolute',
            top: 24,
            left: 28,
            zIndex: 10,
          }}
        >
          Back
        </button>
      )}
    </div>
  )
}
