'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import { useThree, useFrame } from '@react-three/fiber'
import { PSP_CONFIG } from '@/lib/config'

export default function IframeScreen() {
  const cssRendererRef = useRef<CSS3DRenderer | null>(null)
  const cssSceneRef = useRef<THREE.Scene | null>(null)
  const cssObjectRef = useRef<CSS3DObject | null>(null)
  const { camera, gl, size } = useThree()

  // Initialize CSS3D renderer and scene once on mount
  useEffect(() => {
    const container = gl.domElement.parentElement
    if (!container) return

    // Create CSS scene
    const cssScene = new THREE.Scene()
    cssSceneRef.current = cssScene

    // Create iframe element
    const iframe = document.createElement('iframe')
    iframe.src = PSP_CONFIG.screen.url
    iframe.style.width = `${PSP_CONFIG.screen.width}px`
    iframe.style.height = `${PSP_CONFIG.screen.height}px`
    iframe.style.border = 'none'
    iframe.style.background = '#000'

    // Wrap iframe in CSS3D object
    const cssObject = new CSS3DObject(iframe)
    cssObject.position.copy(PSP_CONFIG.screen.position)
    cssObject.rotation.copy(PSP_CONFIG.screen.rotation)
    cssScene.add(cssObject)
    cssObjectRef.current = cssObject

    // Create CSS3D Renderer
    const cssRenderer = new CSS3DRenderer()
    
    // Style the CSS renderer to be behind WebGL
    cssRenderer.domElement.style.position = 'absolute'
    cssRenderer.domElement.style.top = '0'
    cssRenderer.domElement.style.left = '0'
    cssRenderer.domElement.style.pointerEvents = 'none'
    cssRenderer.domElement.style.zIndex = '0'
    
    // Insert CSS renderer before WebGL canvas
    container.insertBefore(cssRenderer.domElement, container.firstChild)
    cssRendererRef.current = cssRenderer

    // Set initial size
    cssRenderer.setSize(size.width, size.height)

    // Cleanup only on unmount
    return () => {
      if (cssRendererRef.current && container.contains(cssRendererRef.current.domElement)) {
        container.removeChild(cssRendererRef.current.domElement)
      }
      cssRendererRef.current = null
      cssSceneRef.current = null
      cssObjectRef.current = null
    }
  }, [gl])

  // Handle resize separately without recreating the renderer
  useEffect(() => {
    if (cssRendererRef.current) {
      cssRendererRef.current.setSize(size.width, size.height)
    }
  }, [size.width, size.height])

  // Render CSS3D on every frame and handle backface visibility
  useFrame(() => {
    if (cssRendererRef.current && cssSceneRef.current && camera && cssObjectRef.current) {
      // Calculate screen normal vector (facing forward in local space, then apply rotation)
      const screenNormal = new THREE.Vector3(0, 0, 1)
      screenNormal.applyEuler(cssObjectRef.current.rotation)
      
      // Calculate vector from screen to camera
      const cameraDirection = new THREE.Vector3()
      camera.getWorldPosition(cameraDirection)
      cameraDirection.sub(cssObjectRef.current.position).normalize()
      
      // Calculate dot product between screen normal and camera direction
      const dotProduct = screenNormal.dot(cameraDirection)
      
      // Hide iframe when viewing from the back (dotProduct < 0)
      const element = cssObjectRef.current.element as HTMLElement
      if (dotProduct < 0) {
        element.style.visibility = 'hidden'
      } else {
        element.style.visibility = 'visible'
      }
      
      cssRendererRef.current.render(cssSceneRef.current, camera)
    }
  })

  return null
}
