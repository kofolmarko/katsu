'use client'

import { useGLTF } from '@react-three/drei'
import { useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'

export default function CoffeeCup() {
  // Positioned on the coffee table — right of PSP, front-right quadrant
  // Table center: [0, 0, -130], topY=40, rotated 45°
  // PSP spans world X ~[-16, 0]; cup sits at X=12, clear of PSP on the right side
  const pos: [number, number, number] = [12, 40, -121]

  const { scene } = useGLTF('/models/coffeecup.glb')
  const [hovered, setHovered] = useState(false)

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    window.open('https://obkavici.si', '_blank', 'noopener,noreferrer')
  }

  const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerLeave = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(false)
    document.body.style.cursor = 'auto'
  }

  return (
    <group
      position={pos}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <primitive
        object={scene.clone()}
        scale={hovered ? 4.15 : 4}
        castShadow
        receiveShadow
      />
    </group>
  )
}

// Preload the model
useGLTF.preload('/models/coffeecup.glb')
