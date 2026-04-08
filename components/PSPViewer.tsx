'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { CameraControls, Environment } from '@react-three/drei'
import { EffectComposer, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import PSPModel from './PSPModel'
import IframeScreen from './IframeScreen'
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
  onZoomSettled,
}: {
  zoomed: boolean
  controlsRef: React.RefObject<CameraControls | null>
  onZoomSettled: (settled: boolean) => void
}) {
  const { size } = useThree()
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const wasZoomed = useRef(false)

  useEffect(() => {
    const ctrl = controlsRef.current
    if (!ctrl) return

    const animate = zoomed !== wasZoomed.current  // animate on state change, snap on resize
    wasZoomed.current = zoomed

    // Iframe is hidden while the zoom-in animation plays; flipped true only once the
    // setLookAt promise settles. Zoom-out hides it immediately.
    if (!zoomed) onZoomSettled(false)

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
      ctrl.setLookAt(targetX, targetY + D, targetZ, targetX, targetY, targetZ, true)
        .then(() => onZoomSettled(true))
    } else {
      const [px, py, pz] = SCENE_CONFIG.camera.overview.position
      const [tx, ty, tz] = SCENE_CONFIG.camera.overview.target
      ctrl.setLookAt(px, py, pz, tx, ty, tz, animate)
    }
  }, [zoomed, size.width, size.height])

  return null
}

export default function PSPViewer() {
  const [zoomed, setZoomed] = useState(false)
  const [zoomSettled, setZoomSettled] = useState(false)
  const [iframeReady, setIframeReady] = useState(true)
  const cameraControlsRef = useRef<CameraControls>(null)
  const isClampingRef = useRef(false)
  const smoothTimeSet = useRef(false)

  useEffect(() => {
    const ctrl = cameraControlsRef.current
    if (ctrl && !smoothTimeSet.current) {
      ctrl.smoothTime = 500
      smoothTimeSet.current = true
    }
  }, [])

  const handleZoomOut = useCallback(() => {
    setIframeReady(false) // Start iframe fade-out, camera zoom will happen in onFadeOutComplete
  }, [])

  const handleIframeFadeOutComplete = useCallback(() => {
    setZoomed(false) // Now start the camera zoom-out animation
    setTimeout(() => setIframeReady(true), 300) // Reset for next zoom-in
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
          pointerEvents: zoomed ? 'none' : 'auto'
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
          <Vignette eskil={false} offset={0.25} darkness={0.65} />
        </EffectComposer>

        <DynamicCameraController
          zoomed={zoomed}
          controlsRef={cameraControlsRef}
          onZoomSettled={setZoomSettled}
        />
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

      <IframeScreen zoomed={iframeReady && zoomSettled} onFadeOutComplete={handleIframeFadeOutComplete} />

      {zoomed && (
        <button
          onClick={handleZoomOut}
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: 10,
            padding: '8px 18px',
            background: 'rgba(255, 255, 255, 0.72)',
            color: '#333',
            border: '1px solid rgba(0,0,0,0.10)',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            backdropFilter: 'blur(6px)',
            letterSpacing: '0.02em'
          }}
        >
          ← Back
        </button>
      )}

      {!zoomed && (
        <div
          style={{
            position: 'absolute',
            bottom: 28,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            color: 'rgba(60, 40, 20, 0.4)',
            fontSize: 13,
            letterSpacing: '0.07em',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          click the PSP to interact
        </div>
      )}
    </div>
  )
}
