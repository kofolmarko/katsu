'use client'

export default function Door() {
  // Door on left wall (x=-170), pushed to back-wall corner — left jamb ~5 units from back wall
  const wallX = -170
  const doorW = 90   // European standard width, along Z
  const doorH = 210
  const doorZ = -244   // left jamb outer at z≈-295 (5 units from back wall z=-300)

  return (
    <group>
      {/* Door panel */}
      <mesh position={[wallX + 2.5, doorH / 2, doorZ]} castShadow receiveShadow>
        <boxGeometry args={[5, doorH, doorW]} />
        <meshStandardMaterial color="#F0EBE3" roughness={0.75} metalness={0} />
      </mesh>

      {/* Frame — top */}
      <mesh position={[wallX + 2.5, doorH + 4, doorZ]} castShadow>
        <boxGeometry args={[6, 8, doorW + 12]} />
        <meshStandardMaterial color="#8B6B4A" roughness={0.6} metalness={0} />
      </mesh>

      {/* Frame — left jamb */}
      <mesh position={[wallX + 2.5, doorH / 2, doorZ - doorW / 2 - 3]} castShadow>
        <boxGeometry args={[6, doorH, 6]} />
        <meshStandardMaterial color="#8B6B4A" roughness={0.6} metalness={0} />
      </mesh>

      {/* Frame — right jamb */}
      <mesh position={[wallX + 2.5, doorH / 2, doorZ + doorW / 2 + 3]} castShadow>
        <boxGeometry args={[6, doorH, 6]} />
        <meshStandardMaterial color="#8B6B4A" roughness={0.6} metalness={0} />
      </mesh>

      {/* Door knob */}
      <mesh position={[wallX + 6.5, 105, doorZ + 36]}>
        <sphereGeometry args={[3.5, 12, 12]} />
        <meshStandardMaterial color="#C0C0C0" roughness={0.2} metalness={0.9} />
      </mesh>
    </group>
  )
}
