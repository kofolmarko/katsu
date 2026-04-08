'use client'

import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

export default function WallDecor() {
  // Load frame textures
  const photoTexture = useTexture('/stickers/photo-frame.jpg')
  const blackFrameTexture = useTexture('/stickers/black-frame.jpg')

  // Configure textures to fill completely without clipping
  photoTexture.wrapS = photoTexture.wrapT = THREE.ClampToEdgeWrapping
  photoTexture.minFilter = THREE.LinearFilter
  
  blackFrameTexture.wrapS = blackFrameTexture.wrapT = THREE.ClampToEdgeWrapping
  blackFrameTexture.minFilter = THREE.LinearFilter

  return (
    <group>
      {/* Photo frame — back wall, landscape */}
      <mesh position={[0, 160, -299]} castShadow receiveShadow>
        <boxGeometry args={[84, 54, 3]} />
        <meshStandardMaterial color="#D4C9B8" roughness={0.7} metalness={0} />
      </mesh>
      <mesh position={[0, 160, -297.3]} receiveShadow>
        <planeGeometry args={[84, 54]} />
        <meshStandardMaterial 
          map={photoTexture} 
          roughness={0.6} 
          metalness={0}
          envMapIntensity={0.3}
        />
      </mesh>

      {/* Black poster — back wall, portrait, left of photo frame */}
      <mesh position={[-110, 160, -299]} castShadow receiveShadow>
        <boxGeometry args={[90, 114, 3]} />
        <meshStandardMaterial color="#2A2A2A" roughness={0.5} metalness={0} />
      </mesh>
      <mesh position={[-110, 160, -297.3]} receiveShadow>
        <planeGeometry args={[90, 114]} />
        <meshStandardMaterial 
          map={blackFrameTexture} 
          roughness={0.6} 
          metalness={0}
          envMapIntensity={0.3}
        />
      </mesh>
    </group>
  )
}

// Preload frame textures
useTexture.preload('/stickers/photo-frame.jpg')
useTexture.preload('/stickers/black-frame.jpg')
