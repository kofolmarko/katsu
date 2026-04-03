'use client'

import { useGLTF } from '@react-three/drei'
import { PSP_CONFIG } from '@/lib/config'

export default function PSPModel() {
  const { scene } = useGLTF(PSP_CONFIG.model.path)

  return (
    <primitive
      object={scene}
      scale={PSP_CONFIG.model.scale}
      position={PSP_CONFIG.model.position}
      rotation={PSP_CONFIG.model.rotation}
    />
  )
}

// Preload the model for better performance
useGLTF.preload(PSP_CONFIG.model.path)
