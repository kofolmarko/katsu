import * as THREE from 'three'

export const PSP_CONFIG = {
  model: {
    path: '/models/sony_psp.glb',
    scale: 50,
    position: [0, -20, 0] as [number, number, number],
    rotation: [-Math.PI / 2, 0, 0] as [number, number, number]
  },
  screen: {
    width: 480,
    height: 272,
    position: new THREE.Vector3(0, 45, -23),
    rotation: new THREE.Euler(-Math.PI / 2, 0, 0),
    url: 'https://www.obkavici.si/'
  }
}

export const SCENE_CONFIG = {
  camera: {
    position: [0, 800, 0] as [number, number, number],
    fov: 45,
    near: 0.1,
    far: 20000
  },
  ground: {
    position: [0, -25, 0] as [number, number, number],
    size: [2000, 2000] as [number, number],
    color: '#2a2a2a'
  },
  background: '#1a1a1a'
}

export const LIGHTING_CONFIG = {
  ambient: {
    intensity: 0.6
  },
  directional: {
    position: [500, 1000, 300] as [number, number, number],
    intensity: 0.8
  },
  point: {
    position: [0, 45, -23] as [number, number, number],
    color: '#4488ff',
    intensity: 0.5,
    distance: 200
  }
}
