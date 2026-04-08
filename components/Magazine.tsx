'use client'

export default function Magazine() {
  // Positioned on the coffee table — back-left quadrant, behind the PSP
  // Table center: [0, 0, -130], topY=40, rotated 45°
  // PSP spans world X ~[-16, 0], Z ~[-129, -121]; magazine sits behind with ~3 unit gap
  const pos: [number, number, number] = [-10, 40, -143]

  return (
    <group position={pos}>
      {/* Magazine - thin rectangular box */}
      <mesh position={[0, 0.2, 0]} rotation={[0, Math.PI / 6, 0]} castShadow receiveShadow>
        <boxGeometry args={[12, 0.3, 18]} />
        <meshStandardMaterial 
          color="#E8DCC8" 
          roughness={0.7} 
          metalness={0.0}
        />
      </mesh>

      {/* Magazine cover accent (darker strip to look like text/image) */}
      <mesh position={[0, 0.36, 2]} rotation={[0, Math.PI / 6, 0]} receiveShadow>
        <boxGeometry args={[10, 0.02, 8]} />
        <meshStandardMaterial 
          color="#6B8E9E" 
          roughness={0.6} 
          metalness={0.0}
        />
      </mesh>

      {/* Pen — sub-group lying flat on the magazine surface.
           rotation [PI/2, PI/4, 0]: first X-rotate lays the cylinder along Z,
           then Y-rotate angles it 45° so it sits diagonally across the magazine.
           Y=0.65 keeps the pen (radius 0.25) clear of the magazine top (Y≈0.35). */}
      <group position={[1, 0.65, 1]} rotation={[Math.PI / 2, Math.PI / 4, 0]}>
        {/* Body */}
        <mesh castShadow>
          <cylinderGeometry args={[0.25, 0.25, 10, 16]} />
          <meshStandardMaterial color="#2C3E50" roughness={0.4} metalness={0.3} />
        </mesh>

        {/* Clip — runs along the upper half of the body */}
        <mesh position={[0.27, 2, 0]} castShadow>
          <boxGeometry args={[0.1, 5, 0.25]} />
          <meshStandardMaterial color="#BDC3C7" roughness={0.3} metalness={0.6} />
        </mesh>

        {/* Tip */}
        <mesh position={[0, -5.5, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.05, 1.5, 16]} />
          <meshStandardMaterial color="#1A1A1A" roughness={0.5} metalness={0.2} />
        </mesh>
      </group>
    </group>
  )
}
