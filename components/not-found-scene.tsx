"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export function NotFoundScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mousePosition = useRef({ x: 0, y: 0 })
  const scrollProgress = useRef(0)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000)
    camera.position.z = 1

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    })
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    containerRef.current.appendChild(renderer.domElement)

    // Texture loader
    const textureLoader = new THREE.TextureLoader()
    const layers: THREE.Mesh[] = []

    // Calculate aspect ratio
    const aspect = window.innerWidth / window.innerHeight

    const createShadowTexture = () => {
      const canvas = document.createElement("canvas")
      canvas.width = 256
      canvas.height = 256
      const ctx = canvas.getContext("2d")
      if (!ctx) return null

      const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
      gradient.addColorStop(0, "rgba(0, 0, 0, 0.4)")
      gradient.addColorStop(0.5, "rgba(0, 0, 0, 0.2)")
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 256, 256)

      const texture = new THREE.CanvasTexture(canvas)
      return texture
    }

    const shadowTexture = createShadowTexture()

    // Adam shadow
    const adamShadowGeometry = new THREE.PlaneGeometry(1.2, 0.8)
    const adamShadowMaterial = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    })
    const adamShadow = new THREE.Mesh(adamShadowGeometry, adamShadowMaterial)
    adamShadow.position.set(-0.2, -0.6, -2.1)
    scene.add(adamShadow)

    // Adam
    const adamTexture = textureLoader.load("/images/adam.png")
    adamTexture.colorSpace = THREE.SRGBColorSpace
    const adamGeometry = new THREE.PlaneGeometry(1.4, 1.5)
    const adamMaterial = new THREE.MeshBasicMaterial({
      map: adamTexture,
      transparent: true,
      depthWrite: false,
    })
    const adamMesh = new THREE.Mesh(adamGeometry, adamMaterial)
    adamMesh.position.set(-0.2, 0, -2)
    scene.add(adamMesh)
    layers.push(adamMesh)

    // God shadow
    const godShadowGeometry = new THREE.PlaneGeometry(1.5, 0.9)
    const godShadowMaterial = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    })
    const godShadow = new THREE.Mesh(godShadowGeometry, godShadowMaterial)
    godShadow.position.set(0.56, -0.55, -1.1)
    scene.add(godShadow)

    // God
    const godTexture = textureLoader.load("/images/god.png")
    godTexture.colorSpace = THREE.SRGBColorSpace
    const godGeometry = new THREE.PlaneGeometry(1.8, 1.5)
    const godMaterial = new THREE.MeshBasicMaterial({
      map: godTexture,
      transparent: true,
      depthWrite: false,
    })
    const godMesh = new THREE.Mesh(godGeometry, godMaterial)
    godMesh.position.set(0.56, 0, -1)
    scene.add(godMesh)
    layers.push(godMesh)

    // --- GLOW EFFECTS ---
    const circleGeometry = new THREE.CircleGeometry(0.05, 64)
    const circleMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1.0,
      depthWrite: false,
    })
    const glowCircle = new THREE.Mesh(circleGeometry, circleMaterial)
    glowCircle.position.set(-0.3, -0.12, 0)
    glowCircle.scale.set(0, 0, 1)
    scene.add(glowCircle)

    const glowRings: THREE.Mesh[] = []
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.RingGeometry(0.05 + i * 0.02, 0.06 + i * 0.02, 64)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.position.set(-0.3, -0.12, 0)
      ring.scale.set(0, 0, 0.3)
      scene.add(ring)
      glowRings.push(ring)
    }

    // --- HANDLERS ---
    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current.x = (event.clientX / window.innerWidth) * 2 - 1
      mousePosition.current.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    const handleScroll = (event: WheelEvent) => {
      event.preventDefault()
      // Slower scroll speed for smoother control (0.0005 instead of 0.0009)
      scrollProgress.current = Math.max(0, Math.min(1, scrollProgress.current + event.deltaY * 0.0005))
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("wheel", handleScroll, { passive: false })

    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const newAspect = width / height

      camera.left = -newAspect
      camera.right = newAspect
      camera.updateProjectionMatrix()

      renderer.setSize(width, height)
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    // --- ANIMATION ---
    const animate = () => {
      requestAnimationFrame(animate)

      const parallaxStrength = [0.03, 0.04]

      // 1. Calculate Glow Logic - now starts at 60% scroll and expands more slowly
      const triggerThreshold = 0.6 // Glow starts after 60% scroll (was 0.4)
      let glowProgress = 0

      if (scrollProgress.current > triggerThreshold) {
        // Normalize the remaining scroll (0.6 to 1.0) into a (0.0 to 1.0) range
        glowProgress = (scrollProgress.current - triggerThreshold) / (1 - triggerThreshold)
      }

      // 2. Parallax & Layer Movement
      layers.forEach((layer, index) => {
        const targetX = mousePosition.current.x * parallaxStrength[index]
        const targetY = mousePosition.current.y * parallaxStrength[index]

        if (index === 0) {
          // Adam
          layer.position.x += (-0.8 + targetX - layer.position.x) * 0.1
          layer.position.y += (-0.2 + targetY - layer.position.y) * 0.1
          adamShadow.position.x += (-0.8 + targetX - adamShadow.position.x) * 0.1
          adamShadow.position.y += (-0.6 + targetY - adamShadow.position.y) * 0.1
        } else if (index === 1) {
          // God
          const godBaseX = 0.6 - scrollProgress.current * 0.1
          layer.position.x += (godBaseX + targetX - layer.position.x) * 0.1
          layer.position.y += (-0.18 + targetY - layer.position.y) * 0.1
          godShadow.position.x += (godBaseX + targetX - godShadow.position.x) * 0.1
          godShadow.position.y += (-0.55 + targetY - godShadow.position.y) * 0.1
        }
      })

      // 3. Apply Scaled Progress to Glow
      const maxScale = 50

      // Use glowProgress instead of scrollProgress.current
      const circleScale = glowProgress * maxScale
      glowCircle.scale.set(circleScale, circleScale, 1)

      glowRings.forEach((ring, i) => {
        const ringScale = glowProgress * (maxScale + i * 2)
        ring.scale.set(ringScale, ringScale, 1)
      })

      renderer.render(scene, camera)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("wheel", handleScroll)
      window.removeEventListener("resize", handleResize)
      const container = containerRef.current
      if (container && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      layers.forEach((layer) => {
        layer.geometry.dispose()
        if (Array.isArray(layer.material)) {
          layer.material.forEach((mat) => mat.dispose())
        } else {
          layer.material.dispose()
        }
      })
      adamShadow.geometry.dispose()
      adamShadowMaterial.dispose()
      godShadow.geometry.dispose()
      godShadowMaterial.dispose()
      glowCircle.geometry.dispose()
      circleMaterial.dispose()
      glowRings.forEach((ring) => {
        ring.geometry.dispose()
        if (Array.isArray(ring.material)) {
          ring.material.forEach((mat) => mat.dispose())
        } else {
          ring.material.dispose()
        }
      })
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-screen fixed inset-0 overflow-hidden"
      style={{ touchAction: "none" }}
    />
  )
}
