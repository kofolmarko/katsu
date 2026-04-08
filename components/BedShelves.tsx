'use client'

interface BedShelvesProps {
  side: 'left' | 'right'
}

export default function BedShelves({ side }: BedShelvesProps) {
  const shelfX = side === 'left' ? -157.5 : 157.5
  const barZs = [-130, -50, 30]

  const shelfMat = <meshStandardMaterial color="#D4C8B8" roughness={0.6} metalness={0} />
  const barMat = <meshStandardMaterial color="#888888" roughness={0.3} metalness={0.7} />

  return (
    <group>
      {/* Lower shelf */}
      <mesh position={[shelfX, 151.5, -50]} castShadow receiveShadow>
        <boxGeometry args={[25, 3, 200]} />
        {shelfMat}
      </mesh>

      {/* Upper shelf */}
      <mesh position={[shelfX, 201.5, -50]} castShadow receiveShadow>
        <boxGeometry args={[25, 3, 200]} />
        {shelfMat}
      </mesh>

      {/* 3 vertical metal bars */}
      {barZs.map((z, i) => (
        <mesh key={i} position={[shelfX, 176.5, z]} castShadow>
          <cylinderGeometry args={[1.5, 1.5, 53, 8]} />
          {barMat}
        </mesh>
      ))}
    </group>
  )
}
