'use client'

import { useTexture } from '@react-three/drei'

interface BedProps {
  side: 'left' | 'right'
}

export default function Bed({ side }: BedProps) {
  const x      = side === 'left' ? -125 : 125
  const pos: [number, number, number] = [x, 0, -93]
  // Room-centre direction: left bed's inner face is +x, right bed's is -x
  const innerX = side === 'left' ? 1 : -1

  // Load sticker textures (only for left bed but load them always to avoid conditional hooks)
  const [sticker1, sticker2, sticker3] = useTexture([
    '/stickers/sticker1.png',
    '/stickers/sticker2.png',
    '/stickers/sticker3.png',
  ])

  // Configure textures to fill the square properly
  if (side === 'left') {
    [sticker1, sticker2, sticker3].forEach(texture => {
      texture.center.set(0.5, 0.5)
      texture.repeat.set(1, 1)
    })
  }

  // Left bed (green sheets) has a thinner mattress
  const mattressH = side === 'left' ? 10 : 20
  const mattressY = 30 + mattressH / 2   // frame top is always y=30

  return (
    <group position={pos}>
      {/* ── Drawer — yellow front 3/4 (foot/camera side) ── */}
      <mesh position={[0, 10, 25]} castShadow receiveShadow>
        <boxGeometry args={[90, 20, 150]} />
        <meshStandardMaterial color="#FFCC00" roughness={0.5} metalness={0.02} />
      </mesh>

      {/* ── Drawer back 1/4 — wood section on pillow/head side ── */}
      <mesh position={[0, 10, -75]} castShadow receiveShadow>
        <boxGeometry args={[90, 20, 50]} />
        <meshStandardMaterial color="#5C3A1E" roughness={0.6} metalness={0} />
      </mesh>

      {/* ── Handles on the room-centre X face of the yellow section ──
           Thin vertical bars like the wardrobe, protruding 2 units from the inner face.
           Two handles spaced along the yellow section (z: -50 to +100).            ── */}
      <mesh position={[innerX * 46.5, 10, -10]} castShadow>
        <boxGeometry args={[2, 12, 1.5]} />
        <meshStandardMaterial color="#888888" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[innerX * 46.5, 10, 85]} castShadow>
        <boxGeometry args={[2, 12, 1.5]} />
        <meshStandardMaterial color="#888888" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* ── Frame plank ── */}
      <mesh position={[0, 25, 0]} castShadow receiveShadow>
        <boxGeometry args={[90, 10, 200]} />
        <meshStandardMaterial color="#5C3A1E" roughness={0.6} metalness={0} />
      </mesh>

      {/* ── Head bumper ── */}
      <mesh position={[0, 35, -98.5]} castShadow receiveShadow>
        <boxGeometry args={[90, 15, 3]} />
        <meshStandardMaterial color="#5C3A1E" roughness={0.6} metalness={0} />
      </mesh>

      {/* ── Left bed bigger head bumper ── */}
      {side === 'left' && (
        <mesh position={[0, 35, -98.5]} castShadow receiveShadow>
          <boxGeometry args={[70, 60, 3]} />
          <meshStandardMaterial color="#5C3A1E" roughness={0.6} metalness={0} />
        </mesh>
      )}

      {/* ── Wood on wall beside bed ── */}
      <mesh position={[innerX * -43, 40, -5]} castShadow receiveShadow>
        <boxGeometry args={[3, 70, 200]} />
        <meshStandardMaterial color="#5C3A1E" roughness={0.6} metalness={0} />
      </mesh>

      {/* Stickers with textures only on left bed */}
      {side === 'left' && (
        <>
          <mesh position={[-41, 55, -75]} castShadow rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[8, 8]} />
            <meshStandardMaterial 
              map={sticker1} 
              transparent 
              roughness={0.15} 
              metalness={0.3}
              envMapIntensity={0.8}
            />
          </mesh>
          <mesh position={[-41, 65, -65]} castShadow rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[8, 8]} />
            <meshStandardMaterial 
              map={sticker2} 
              transparent 
              roughness={0.15} 
              metalness={0.3}
              envMapIntensity={0.8}
            />
          </mesh>
          <mesh position={[-41, 60, -55]} castShadow rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[8, 8]} />
            <meshStandardMaterial 
              map={sticker3} 
              transparent 
              roughness={0.15} 
              metalness={0.3}
              envMapIntensity={0.8}
            />
          </mesh>
        </>
      )}

      {/* ── Mattress ── */}
      <mesh position={[0, mattressY, 0]} castShadow receiveShadow>
        <boxGeometry args={[86, mattressH, 196]} />
        <meshStandardMaterial color="#E8E0D8" roughness={0.85} metalness={0} />
      </mesh>

    </group>
  )
}

// Preload sticker textures
useTexture.preload('/stickers/sticker1.png')
useTexture.preload('/stickers/sticker2.png')
useTexture.preload('/stickers/sticker3.png')
