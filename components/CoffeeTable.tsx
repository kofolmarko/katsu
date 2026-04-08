'use client'

import { SCENE_CONFIG } from '@/lib/config'

export default function CoffeeTable() {
  const { position, rotationY, topY, width, depth, topThickness, legSize, legInset, color, roughness, metalness } = SCENE_CONFIG.table

  const legHeight = topY - topThickness
  const legY = legHeight / 2
  const halfW = width / 2 - legInset
  const halfD = depth / 2 - legInset

  const mat = <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />

  const legs: [number, number, number][] = [
    [ halfW, legY,  halfD],
    [-halfW, legY,  halfD],
    [ halfW, legY, -halfD],
    [-halfW, legY, -halfD],
  ]

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Tabletop */}
      <mesh position={[0, topY - topThickness / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, topThickness, depth]} />
        {mat}
      </mesh>

      {/* Legs */}
      {legs.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow receiveShadow>
          <boxGeometry args={[legSize, legHeight, legSize]} />
          {mat}
        </mesh>
      ))}
    </group>
  )
}
