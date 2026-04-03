'use client'

import { LIGHTING_CONFIG } from '@/lib/config'

export default function Lights() {
  return (
    <>
      <ambientLight intensity={LIGHTING_CONFIG.ambient.intensity} />
      <directionalLight 
        position={LIGHTING_CONFIG.directional.position} 
        intensity={LIGHTING_CONFIG.directional.intensity} 
      />
      <pointLight 
        position={LIGHTING_CONFIG.point.position} 
        color={LIGHTING_CONFIG.point.color} 
        intensity={LIGHTING_CONFIG.point.intensity} 
        distance={LIGHTING_CONFIG.point.distance} 
      />
    </>
  )
}
