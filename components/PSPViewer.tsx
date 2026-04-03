'use client'

import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import PSPModel from './PSPModel'
import IframeScreen from './IframeScreen'
import Lights from './Lights'
import { SCENE_CONFIG } from '@/lib/config'

export default function PSPViewer() {
  // Handle WebGL context loss
  useEffect(() => {
    const handleContextLost = (event: Event) => {
      event.preventDefault()
      console.warn('WebGL context lost. Attempting to restore...')
    }

    const handleContextRestored = () => {
      console.log('WebGL context restored successfully')
      // Force a re-render if needed
      window.location.reload()
    }

    // Wait for canvas to be available
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
    <Canvas
      camera={{
        position: SCENE_CONFIG.camera.position,
        fov: SCENE_CONFIG.camera.fov,
        near: SCENE_CONFIG.camera.near,
        far: SCENE_CONFIG.camera.far
      }}
      gl={{
        antialias: true,
        alpha: false,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false
      }}
      onCreated={({ gl }) => {
        // Prevent context loss during cleanup
        gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault())
      }}
      style={{ 
        background: SCENE_CONFIG.background,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
      }}
    >
      <Lights />
      
      {/* Ground Plane */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={SCENE_CONFIG.ground.position} 
        receiveShadow
      >
        <planeGeometry args={SCENE_CONFIG.ground.size} />
        <meshStandardMaterial 
          color={SCENE_CONFIG.ground.color} 
          roughness={0.8} 
          metalness={0.2} 
        />
      </mesh>

      <PSPModel />
      <IframeScreen />
      
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        target={[0, 0, 0]}
      />
    </Canvas>
  )
}
