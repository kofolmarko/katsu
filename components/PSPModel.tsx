'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { PSP_BUTTON_ACTIONS, PSP_CONFIG, PSP_IFRAME_ID } from '@/lib/config'

const BUTTON_NAME_RE = /^button(\d+)_/

function getButtonAction(name: string): string | undefined {
  const m = name.match(BUTTON_NAME_RE)
  if (!m) return undefined
  return PSP_BUTTON_ACTIONS[parseInt(m[1], 10)]
}

function sendPSPAction(action: string) {
  const el = document.getElementById(PSP_IFRAME_ID) as HTMLIFrameElement | null
  el?.contentWindow?.postMessage({ type: 'psp_button', action }, '*')
}

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
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  // Basis positions for button meshes, captured once — used to animate a press.
  const buttonBaseRef = useRef<Map<string, THREE.Vector3>>(new Map())
  // name -> remaining press animation time (seconds)
  const pressTimersRef = useRef<Map<string, number>>(new Map())
  const groupRef = useRef<THREE.Group>(null)
  const timeRef  = useRef(0)

  // Swap the screen mesh's material for a plain black one and give each button
  // its own material clone so we can highlight/animate them individually.
  // All PSP parts share a single material in the GLB, so we must clone rather
  // than mutate.
  useEffect(() => {
    const bases = new Map<string, THREE.Vector3>()
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      if (child.name.startsWith('screen_low')) {
        child.material = new THREE.MeshBasicMaterial({ color: '#000000' })
        return
      }
      if (BUTTON_NAME_RE.test(child.name)) {
        const mat = child.material as THREE.MeshStandardMaterial
        if (mat?.isMeshStandardMaterial) {
          child.material = mat.clone()
        }
        bases.set(child.name, child.position.clone())
      }
    })
    buttonBaseRef.current = bases
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

  const PRESS_DURATION = 0.18
  const PRESS_DEPTH = 0.18 // local-space Z depth (PSP face normal)

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

    // Advance per-button press animations. Button meshes live in the GLB's
    // local frame where +Z is the PSP face-up normal, so pressing = offset -Z.
    const bases = buttonBaseRef.current
    const timers = pressTimersRef.current
    if (timers.size > 0) {
      for (const [name, remaining] of timers) {
        const mesh = scene.getObjectByName(name) as THREE.Mesh | null
        const base = bases.get(name)
        if (!mesh || !base) { timers.delete(name); continue }
        const next = remaining - delta
        if (next <= 0) {
          mesh.position.copy(base)
          timers.delete(name)
        } else {
          // triangle wave: 0 → 1 → 0 over PRESS_DURATION
          const t = 1 - next / PRESS_DURATION
          const k = t < 0.5 ? t * 2 : (1 - t) * 2
          mesh.position.set(base.x, base.y, base.z - k * PRESS_DEPTH)
          timers.set(name, next)
        }
      }
    }
  })

  // Whole-PSP hover glow (only in overview mode, so per-button highlight can
  // stand out when zoomed in).
  useEffect(() => {
    const glow = hovered && !zoomed
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      if (BUTTON_NAME_RE.test(child.name)) return // handled by per-button effect
      const mat = child.material as THREE.MeshStandardMaterial
      if (!mat?.isMeshStandardMaterial) return
      mat.emissive.set(glow ? '#3366ee' : '#000000')
      mat.emissiveIntensity = glow ? 0.55 : 0
    })
  }, [hovered, zoomed, scene])

  // Per-button hover highlight (only when zoomed — that's when buttons are
  // individually interactable).
  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return
      if (!BUTTON_NAME_RE.test(child.name)) return
      const mat = child.material as THREE.MeshStandardMaterial
      if (!mat?.isMeshStandardMaterial) return
      const isHovered = zoomed && hoveredButton === child.name
      mat.emissive.set(isHovered ? '#4488ff' : '#000000')
      mat.emissiveIntensity = isHovered ? 0.8 : 0
    })
  }, [hoveredButton, zoomed, scene])

  const setHover = (h: boolean) => {
    setHovered(h)
    onHoverChange?.(h)
    if (!zoomed) {
      document.body.style.cursor = h && clickable ? 'pointer' : 'auto'
    }
  }

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    if (!zoomed) {
      // Overview mode — any click on the PSP triggers zoom-in.
      if (onClick) {
        e.stopPropagation()
        onClick()
      }
      return
    }
    const name = e.object.name
    const action = getButtonAction(name)
    if (!action) return
    e.stopPropagation()
    sendPSPAction(action)
    pressTimersRef.current.set(name, PRESS_DURATION)
  }, [zoomed, onClick])

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!zoomed) {
      setHover(true)
      return
    }
    e.stopPropagation()
    const name = e.object.name
    if (getButtonAction(name)) {
      setHoveredButton(name)
      document.body.style.cursor = 'pointer'
    }
  }, [zoomed, clickable])

  const handlePointerOut = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!zoomed) {
      setHover(false)
      return
    }
    e.stopPropagation()
    setHoveredButton(null)
    document.body.style.cursor = 'auto'
  }, [zoomed])

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        scale={PSP_CONFIG.model.scale}
        position={PSP_CONFIG.model.position}
        rotation={PSP_CONFIG.model.rotation}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />

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
