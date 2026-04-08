'use client'

import { LIGHTING_CONFIG } from '@/lib/config'

export default function Lights() {
  const { ambient, main, fill, back, ceiling } = LIGHTING_CONFIG

  return (
    <>
      <ambientLight intensity={ambient.intensity} color={ambient.color} />

      <directionalLight
        position={main.position}
        intensity={main.intensity}
        color={main.color}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-radius={16}
        shadow-camera-near={1}
        shadow-camera-far={2000}
        shadow-camera-left={-500}
        shadow-camera-right={500}
        shadow-camera-top={500}
        shadow-camera-bottom={-500}
      />

      <directionalLight
        position={fill.position}
        intensity={fill.intensity}
        color={fill.color}
      />

      <directionalLight
        position={back.position}
        intensity={back.intensity}
        color={back.color}
      />

      <pointLight
        position={ceiling.position}
        intensity={ceiling.intensity}
        color={ceiling.color}
        distance={400}
        decay={2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-radius={16}
      />
    </>
  )
}
