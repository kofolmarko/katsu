'use client'

import { SCENE_CONFIG } from '@/lib/config'

export default function Wardrobe() {
  const {
    position, width, height, depth,
    topSectionHeight, frameColor, doorColor, roughness, metalness
  } = SCENE_CONFIG.wardrobe

  const bottomH = height - topSectionHeight

  // Doors sit fully in front of the body — no overlap → no z-fighting glitch
  const bodyFrontX = -(depth / 2)          // -27.5 in local space
  const doorThick  = 3
  const doorX      = bodyFrontX - doorThick / 2 - 0.2   // -29.7

  // Z layout: two doors with a 2-unit gap at centre, 1-unit margin at outer edges
  const halfW     = width / 2   // 74
  const gapHalf   = 1           // half of centre gap
  const edgeMargin = 1
  const doorW     = halfW - gapHalf - edgeMargin  // 72
  const leftZ     = -(gapHalf + doorW / 2)        // -37
  const rightZ    =  (gapHalf + doorW / 2)        //  37

  // Handles near the centre gap (inner edge of each door)
  const handleX   = doorX - doorThick / 2 - 0.8
  const leftHZ    = leftZ  + 6
  const rightHZ   = rightZ - 6

  const frameMat  = <meshStandardMaterial color={frameColor} roughness={roughness}       metalness={metalness} />
  const doorMat   = <meshStandardMaterial color={doorColor}  roughness={roughness + 0.1} metalness={metalness} />
  const handleMat = <meshStandardMaterial color="#888888"    roughness={0.3}             metalness={0.7} />

  return (
    <group position={position}>
      {/* Body — solid frame, no interior pieces on the front face */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[depth, height, width]} />
        {frameMat}
      </mesh>

      {/* ── Bottom section: 2 large doors ── */}
      <mesh position={[doorX, bottomH / 2, leftZ]} castShadow receiveShadow>
        <boxGeometry args={[doorThick, bottomH - 4, doorW]} />
        {doorMat}
      </mesh>
      <mesh position={[handleX, bottomH / 2, leftHZ]}>
        <boxGeometry args={[1.2, 14, 2]} />
        {handleMat}
      </mesh>

      <mesh position={[doorX, bottomH / 2, rightZ]} castShadow receiveShadow>
        <boxGeometry args={[doorThick, bottomH - 4, doorW]} />
        {doorMat}
      </mesh>
      <mesh position={[handleX, bottomH / 2, rightHZ]}>
        <boxGeometry args={[1.2, 14, 2]} />
        {handleMat}
      </mesh>

      {/* ── Top section: 2 small doors ── */}
      <mesh position={[doorX, bottomH + topSectionHeight / 2, leftZ]} castShadow receiveShadow>
        <boxGeometry args={[doorThick, topSectionHeight - 4, doorW]} />
        {doorMat}
      </mesh>
      <mesh position={[handleX, bottomH + topSectionHeight / 2, leftHZ]}>
        <boxGeometry args={[1.2, 8, 2]} />
        {handleMat}
      </mesh>

      <mesh position={[doorX, bottomH + topSectionHeight / 2, rightZ]} castShadow receiveShadow>
        <boxGeometry args={[doorThick, topSectionHeight - 4, doorW]} />
        {doorMat}
      </mesh>
      <mesh position={[handleX, bottomH + topSectionHeight / 2, rightHZ]}>
        <boxGeometry args={[1.2, 8, 2]} />
        {handleMat}
      </mesh>
    </group>
  )
}
