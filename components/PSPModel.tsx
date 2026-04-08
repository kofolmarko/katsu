'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PSP_CONFIG } from '@/lib/config'

interface PSPModelProps {
  onClick?: () => void
  clickable?: boolean
  onHoverChange?: (h: boolean) => void
  zoomed?: boolean
}

const BEAM_HEIGHT     = 35
const BEAM_RADIUS_TOP = 6
const BEAM_RADIUS_BOT = 1
const SCREEN_HALF_W   = 4.7
const SCREEN_HALF_D   = 2.65
const HOVER_SCALE     = 1.035 // subtle expand on hover

const beamVert = /* glsl */`
  varying float vFade;
  varying vec2 vUv;
  void main() {
    vFade = clamp((-position.y / ${BEAM_HEIGHT.toFixed(1)}) + 0.5, 0.0, 1.0);
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const beamFrag = /* glsl */`
  #define PI 3.14159265
  varying float vFade;
  varying vec2 vUv;
  uniform vec3  uColor;
  uniform float uOpacity;
  uniform float uTime;

  float streak(float u, float v, float freq, float phase, float scrollSpeed) {
    float s = sin(u * PI * freq + phase - v * 2.5 - uTime * scrollSpeed);
    return pow(max(0.0, s), 22.0);
  }

  void main() {
    float fade = vFade * vFade;
    float s1 = streak(vUv.x, vUv.y,  6.0, 0.00, 0.55);
    float s2 = streak(vUv.x, vUv.y,  4.0, 2.09, 0.38);
    float s3 = streak(vUv.x, vUv.y,  8.0, 4.71, 0.70);
    float streaks = clamp(s1 + s2 + s3, 0.0, 1.0) * vFade;
    vec3  col   = mix(uColor, vec3(1.0), streaks * 0.85);
    float alpha = fade * uOpacity * (1.0 + streaks * 0.6);
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
  }
`

export default function PSPModel({ onClick, clickable = false, onHoverChange, zoomed = false }: PSPModelProps) {
  const { scene } = useGLTF(PSP_CONFIG.model.path)
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef<THREE.Group>(null)
  const timeRef  = useRef(0)

  // Swap the screen mesh's material for a plain black one. All PSP parts share
  // a single material in the GLB, so we must clone rather than mutate.
  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      if (!child.name.startsWith('screen_low')) return
      child.material = new THREE.MeshBasicMaterial({ color: '#000000' })
    })
  }, [scene])

  const { x, y, z } = PSP_CONFIG.screen.position

  const beamMaterial = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: beamVert,
    fragmentShader: beamFrag,
    uniforms: {
      uColor:   { value: new THREE.Color('#4477ff') },
      uOpacity: { value: 0.18 },
      uTime:    { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
  }), [])

  useFrame((_, delta) => {
    timeRef.current += delta
    beamMaterial.uniforms.uTime.value = timeRef.current

    const breathe = 0.5 + Math.sin(timeRef.current * 1.3) * 0.28
    const targetOpacity = zoomed ? 0 : hovered ? 0.38 : 0.13 + breathe * 0.09
    beamMaterial.uniforms.uOpacity.value = THREE.MathUtils.lerp(
      beamMaterial.uniforms.uOpacity.value,
      targetOpacity,
      0.06
    )

    const g = groupRef.current
    if (!g) return
  })

  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      const mat = child.material as THREE.MeshStandardMaterial
      if (!mat?.isMeshStandardMaterial) return
      mat.emissive.set(hovered ? '#3366ee' : '#000000')
      mat.emissiveIntensity = hovered ? 0.55 : 0
    })
  }, [hovered, scene])

  const setHover = (h: boolean) => {
    setHovered(h)
    onHoverChange?.(h)
    document.body.style.cursor = h && clickable ? 'pointer' : 'auto'
  }

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        scale={PSP_CONFIG.model.scale}
        position={PSP_CONFIG.model.position}
        rotation={PSP_CONFIG.model.rotation}
      />

      {/* Invisible hit area — covers full PSP including the screen region */}
      <mesh
        position={PSP_CONFIG.model.position}
        rotation={PSP_CONFIG.model.rotation}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        onClick={onClick}
      >
        <boxGeometry args={[22, 12, 6]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <mesh
        position={[x, y + BEAM_HEIGHT / 2, z]}
        scale={[SCREEN_HALF_W, 1, SCREEN_HALF_D]}
        material={beamMaterial}
      >
        <cylinderGeometry args={[BEAM_RADIUS_TOP, BEAM_RADIUS_BOT, BEAM_HEIGHT, 32, 1, true]} />
      </mesh>
    </group>
  )
}

useGLTF.preload(PSP_CONFIG.model.path)
