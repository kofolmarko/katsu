'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

interface BedDecorProps {
  side: 'left' | 'right'
}

function createDotsTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512; canvas.height = 512
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#F2F0EC'
  ctx.fillRect(0, 0, 512, 512)
  const spacing = 52   // spaced out
  const dotColor = '#1E3A5F'  // dark blue
  for (let row = 0; row * spacing < 512 + spacing; row++) {
    const offsetX = row % 2 === 1 ? spacing / 2 : 0  // stagger every second row
    for (let col = -1; col * spacing + offsetX < 512 + spacing; col++) {
      ctx.beginPath()
      ctx.arc(col * spacing + offsetX, row * spacing + spacing / 2, 5.5, 0, Math.PI * 2)
      ctx.fillStyle = dotColor
      ctx.fill()
    }
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(3, 6)
  return tex
}

function createStripesTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512; canvas.height = 512
  const ctx = canvas.getContext('2d')!
  // Vertical bands (vary along canvas X = world X = bed width).
  // Sides show 1 wide pastel stripe; centre has variety.
  const bands: Array<{ color: string; w: number }> = [
    { color: '#B4CC8E', w: 90 },  // wide pastel sage — left side
    { color: '#A8C8D4', w: 7 },   // thin blue
    { color: '#F2EEE8', w: 24 },  // cream
    { color: '#C6E0A8', w: 52 },  // pastel light green
    { color: '#F2EEE8', w: 22 },  // cream
    { color: '#A8C8D4', w: 7 },   // thin blue
    { color: '#B4CC8E', w: 55 },  // pastel sage centre
    { color: '#A8C8D4', w: 7 },   // thin blue
    { color: '#F2EEE8', w: 22 },  // cream
    { color: '#C6E0A8', w: 52 },  // pastel light green
    { color: '#F2EEE8', w: 24 },  // cream
    { color: '#A8C8D4', w: 7 },   // thin blue
    { color: '#B4CC8E', w: 90 },  // wide pastel sage — right side
    // fill remainder
    { color: '#F2EEE8', w: 53 },
  ]
  // total: 90+7+24+52+22+7+55+7+22+52+24+7+90+53 = 512 ✓
  let x = 0
  for (const { color, w } of bands) {
    ctx.fillStyle = color
    ctx.fillRect(x, 0, w, canvas.height)
    x += w
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 1)
  return tex
}

export default function BedDecor({ side }: BedDecorProps) {
  const sign  = side === 'left' ? -1 : 1
  const bedCX = sign * 125
  const pilZ  = -170

  // Left bed has a thinner mattress (top at y=40); right is standard (top at y=50)
  const mattressTop = side === 'left' ? 40 : 50
  const pilY     = mattressTop + 7
  const blanketY = mattressTop + 5   // bottom at mattressTop+0.5 — no clip

  const sheetTex = useMemo(
    () => side === 'right' ? createDotsTexture() : createStripesTexture(),
    [side]
  )

  const blanketCZ    = (-148 + 5) / 2  // ≈ -71.5
  const blanketDepth = 153

  const mountX     = sign * 168.5
  const armTipX    = sign * 154
  const armCenterX = (mountX + armTipX) / 2
  const armLength  = Math.abs(mountX - armTipX)

  const sheetMat = <meshStandardMaterial map={sheetTex} roughness={0.9} metalness={0} />

  return (
    <group>
      {/* ── Pillow ── */}
      <mesh position={[bedCX, pilY, pilZ]} castShadow receiveShadow>
        <boxGeometry args={[72, 12, 48]} />
        {sheetMat}
      </mesh>

      {/* ── Blanket ── */}
      <mesh position={[bedCX, blanketY, blanketCZ]} castShadow receiveShadow>
        <boxGeometry args={[85, 9, blanketDepth]} />
        {sheetMat}
      </mesh>
      {/* ── Wall sconce lamp ── */}
      <mesh position={[mountX, 118, pilZ]}>
        <boxGeometry args={[1.5, 10, 7]} />
        <meshStandardMaterial color="#B8B0A4" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[armCenterX, 118, pilZ]} castShadow>
        <boxGeometry args={[armLength, 2.5, 2.5]} />
        <meshStandardMaterial color="#B8B0A4" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[armTipX, 107, pilZ]} castShadow>
        <cylinderGeometry args={[4, 9, 18, 10, 1, true]} />
        <meshStandardMaterial color="#F5E8D0" roughness={0.55} metalness={0} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[armTipX, 116, pilZ]}>
        <cylinderGeometry args={[4, 4, 0.8, 10]} />
        <meshStandardMaterial color="#B8B0A4" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[armTipX, 110, pilZ]}>
        <sphereGeometry args={[2.8, 10, 10]} />
        <meshStandardMaterial color="#FFD070" roughness={0.2} metalness={0} emissive="#FFA820" emissiveIntensity={2} />
      </mesh>
    </group>
  )
}
