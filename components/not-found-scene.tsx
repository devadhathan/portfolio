"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export function NotFoundScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mousePosition = useRef({ x: 0, y: 0 })
  const scrollProgress = useRef(0)

  useEffect(() => {
    const currentContainer = containerRef.current
    if (!currentContainer) return

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
    currentContainer.appendChild(renderer.domElement)

    const textureLoader = new THREE.TextureLoader()
    const layers: THREE.Mesh[] = []

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

      return new THREE.CanvasTexture(canvas)
    }

    const disposeMaterial = (material: THREE.Material | THREE.Material[] | null) => {
      if (!material) return
      if (Array.isArray(material)) {
        material.forEach((mat) => mat.dispose())
      } else {
        material.dispose()
      }
    }

    const shadowTexture = createShadowTexture()

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

    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current.x = (event.clientX / window.innerWidth) * 2 - 1
      mousePosition.current.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    const handleScroll = (event: WheelEvent) => {
      event.preventDefault()
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

    const animate = () => {
      requestAnimationFrame(animate)

      const parallaxStrength = [0.03, 0.04]
      const triggerThreshold = 0.6
      let glowProgress = 0

      if (scrollProgress.current > triggerThreshold) {
        glowProgress = (scrollProgress.current - triggerThreshold) / (1 - triggerThreshold)
      }

      layers.forEach((layer, index) => {
        const targetX = mousePosition.current.x * parallaxStrength[index]
        const targetY = mousePosition.current.y * parallaxStrength[index]

        if (index === 0) {
          layer.position.x += (-0.8 + targetX - layer.position.x) * 0.1
          layer.position.y += (-0.2 + targetY - layer.position.y) * 0.1
          adamShadow.position.x += (-0.8 + targetX - adamShadow.position.x) * 0.1
          adamShadow.position.y += (-0.6 + targetY - adamShadow.position.y) * 0.1
        } else if (index === 1) {
          const godBaseX = 0.6 - scrollProgress.current * 0.1
          layer.position.x += (godBaseX + targetX - layer.position.x) * 0.1
          layer.position.y += (-0.18 + targetY - layer.position.y) * 0.1
          godShadow.position.x += (godBaseX + targetX - godShadow.position.x) * 0.1
          godShadow.position.y += (-0.55 + targetY - godShadow.position.y) * 0.1
        }
      })

      const maxScale = 50
      const circleScale = glowProgress * maxScale
      glowCircle.scale.set(circleScale, circleScale, 1)

      glowRings.forEach((ring, i) => {
        const ringScale = glowProgress * (maxScale + i * 2)
        ring.scale.set(ringScale, ringScale, 1)
      })

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("wheel", handleScroll)
      window.removeEventListener("resize", handleResize)
      if (currentContainer) {
        currentContainer.removeChild(renderer.domElement)
      }
      layers.forEach((layer) => {
        layer.geometry.dispose()
        disposeMaterial(layer.material)
      })
      adamShadow.geometry.dispose()
      adamShadowMaterial.dispose()
      godShadow.geometry.dispose()
      godShadowMaterial.dispose()
      glowCircle.geometry.dispose()
      circleMaterial.dispose()
      glowRings.forEach((ring) => {
        ring.geometry.dispose()
        disposeMaterial(ring.material)
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
