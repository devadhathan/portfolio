"use client"

import { useEffect, useState } from "react"
import { NotFoundScene } from "@/components/not-found-scene"

export default function NotFoundPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="relative w-full h-screen">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-start pt-20 pointer-events-none">
        <h1 className="text-7xl font-medium text-white mb-4">404</h1>
        <p className="text-lg text-white/40">This page could not be found</p>
      </div>
      {mounted && <NotFoundScene />}
    </div>
  )
}
