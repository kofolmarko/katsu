import * as THREE from 'three'

// PSP model is 16.76 units wide in GLB space.
// Screen world = [px, py + 1.3*S, pz - 0.46*S]  (derived from known-good scale=50 calibration)
export const PSP_CONFIG = {
  model: {
    path: '/models/sony_psp.glb',
    scale: 1,
    position: [-8, 41, -125] as [number, number, number],
    rotation: [-Math.PI / 2, 0, 0] as [number, number, number]
  },
  screen: {
    width: 480 * 1.5,
    height: 272 * 1.5,
    // Maps iframe pixels to (9.426 * modelScale) world units
    scale: (9.426 * 1) / (480 * 1.5),  // ≈ 0.00982
    position: new THREE.Vector3(-8, 42.3, -125.46),
    rotation: new THREE.Euler(-Math.PI / 2, 0, 0),
    url: 'https://xmb-katsu.vercel.app/'
  }
}

export const SCENE_CONFIG = {
  camera: {
    fov: 38,
    near: 0.1,
    far: 3000,
    overview: {
      // Pulled back to D≈330 from target so maxDistance=350 fits
      position: [50, 120, 175] as [number, number, number],
      target: [0, 45, -140] as [number, number, number]
    },
    // zoomed position is computed dynamically in DynamicCameraController
    // PSP world width: 16.76 * scale; Z center: pz - (6.35 * scale) / 2
    zoomFill: 0.92  // PSP fills this fraction of screen width when zoomed
  },
  room: {
    width: 340,
    height: 260,
    depth: 600,
    floorY: 0,
    wallColor: '#F8F5F0',
    floorColor: '#8B6035',
    ceilingColor: '#F2EEEA'
  },
  table: {
    position: [0, 0, -130] as [number, number, number],
    rotationY: Math.PI / 4,
    topY: 40,
    width: 50,
    depth: 50,
    topThickness: 6,
    legSize: 6,
    legInset: 3,
    color: '#F5F5F3',
    roughness: 0.25,
    metalness: 0.02
  },
  sofa: {
    position: [0, 0, -200] as [number, number, number],
    width: 120,
    seatDepth: 80,
    seatHeight: 45,
    backHeight: 35,
    backDepth: 22,
    color: '#B2A898',
    roughness: 0.88,
    metalness: 0
  },
  // Wardrobe on the right wall, spanning back wall (z=-300) to right bed back (z=-193)
  wardrobe: {
    position: [142, 0, -246] as [number, number, number],
    width: 106,         // along Z axis — back at z≈-299, front at z=-193
    height: 250,        // ~2.5m
    depth: 55,          // along X axis (into room)
    topSectionHeight: 65,
    frameColor: '#EDE8DA',
    doorColor: '#FFCC00',
    roughness: 0.45,
    metalness: 0.05
  },
  background: '#F8F5F0'
}

export const LIGHTING_CONFIG = {
  ambient: { intensity: 0.3, color: '#FFF0DC' },
  main: { position: [0, 500, -150] as [number, number, number], intensity: 0.3, color: '#FFE8D0' },
  fill: { position: [170, 200, 50] as [number, number, number], intensity: 0.08, color: '#FFE0B0' },
  back: { position: [-170, 150, -350] as [number, number, number], intensity: 0.05, color: '#C8D8FF' },
  ceiling: { position: [0, 250, -130] as [number, number, number], intensity: 1.0, color: '#FFD580' }
}
