'use client'

import { SCENE_CONFIG } from '@/lib/config'

export default function RoomBox() {
  const { width, height, depth, floorY, wallColor, floorColor, ceilingColor } = SCENE_CONFIG.room

  const halfW = width / 2
  const halfD = depth / 2
  const ceilY = floorY + height

  return (
    <group>
      {/* Floor — warm brown, slight sheen to read as polished wood */}
      <mesh position={[0, floorY, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={floorColor} roughness={0.45} metalness={0.05} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, ceilY, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={ceilingColor} roughness={0.95} metalness={0} />
      </mesh>

      {/* Back wall — the one the camera faces */}
      <mesh position={[0, floorY + height / 2, -halfD]} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} metalness={0} />
      </mesh>

      {/* Front wall (behind camera, mostly unseen) */}
      <mesh position={[0, floorY + height / 2, halfD]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} metalness={0} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-halfW, floorY + height / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} metalness={0} />
      </mesh>

      {/* Right wall */}
      <mesh position={[halfW, floorY + height / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} metalness={0} />
      </mesh>
    </group>
  )
}
