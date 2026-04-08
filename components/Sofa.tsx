'use client'

import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { SCENE_CONFIG } from '@/lib/config'

export default function Sofa() {
  const { scene } = useGLTF('/models/sofa-low-poly.glb')
  const { position } = SCENE_CONFIG.sofa

  const [modelScale, floorY] = useMemo(() => {
    // Force full matrix update before measuring — nodes have baked-in scales (~30x)
    scene.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    box.getSize(size)
    // Scale to 150cm wide (model includes pillows, so total footprint is wider than bare sofa)
    const s = size.x > 0 ? 150 / size.x : 1
    // Lift so model bottom sits on y=0
    return [s, -box.min.y * s]
  }, [scene])

  // Traverse once to enable shadows
  useMemo(() => {
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (mesh.isMesh) {
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })
  }, [scene])

  // Scale the group, not the primitive — avoids mutating scene.scale and
  // corrupting future bounding box calculations
  return (
    <group
      position={[position[0], floorY, position[2]]}
      scale={modelScale}
      rotation={[0, 0, 0]}
    >
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload('/models/sofa-low-poly.glb')
