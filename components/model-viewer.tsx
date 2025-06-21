"use client"

import dynamic from "next/dynamic"
import { Suspense, useMemo, useState, useEffect } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"

// Dynamically import Canvas and 3D components with no SSR
const Canvas = dynamic(() => import("@react-three/fiber").then((mod) => ({ default: mod.Canvas })), {
  ssr: false,
})

const OrbitControls = dynamic(() => import("@react-three/drei").then((mod) => ({ default: mod.OrbitControls })), {
  ssr: false,
})

const Environment = dynamic(() => import("@react-three/drei").then((mod) => ({ default: mod.Environment })), {
  ssr: false,
})

// Import other components normally since they don't use browser APIs directly
import SceneSetup from "./scene-setup"
import ModelComponent from "./model-component"
import LoadingPlaceholder from "./loading-placeholder"

export default function ModelViewer({ modelUrl }: { modelUrl: string | null }) {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [isCanvasReady, setIsCanvasReady] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
    const timer = setTimeout(() => {
      setIsCanvasReady(true)
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  // Memoize camera settings to prevent flickering
  const cameraSettings = useMemo(
    () => ({
      position: [0, 0, isMobile ? 8 : 5] as [number, number, number],
      fov: isMobile ? 65 : 50,
    }),
    [isMobile],
  )

  // Memoize orbit controls settings
  const orbitSettings = useMemo(
    () => ({
      minDistance: isMobile ? 5 : 3,
      maxDistance: isMobile ? 15 : 10,
      enableZoom: true,
      enablePan: false,
      autoRotate: true,
      autoRotateSpeed: isMobile ? 0.3 : 0.8,
      enableDamping: true,
      dampingFactor: 0.05,
    }),
    [isMobile],
  )

  // Use default model if no URL provided
  const effectiveModelUrl = modelUrl || "/models/model.glb"

  // Don't render anything until we're on the client
  if (!isClient || !isCanvasReady) {
    return (
      <div className="w-full h-[100dvh] bg-black bg-radial-gradient flex items-center justify-center">
        <div className="glass-strong rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="loading-spinner"></div>
            <span className="text-white text-lg">Loading 3D Environment...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-[100dvh] bg-black bg-radial-gradient">
      <Canvas
        camera={cameraSettings}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        dpr={typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 2) : 1}
        performance={{ min: 0.5 }}
        onCreated={({ gl }) => {
          gl.setClearColor("#000000")
        }}
      >
        <SceneSetup />
        <ambientLight intensity={0.3} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <Suspense fallback={<LoadingPlaceholder />}>
          <ModelComponent url={effectiveModelUrl} scale={1} />
        </Suspense>

        <OrbitControls {...orbitSettings} />
        <Environment preset="night" />
      </Canvas>
    </div>
  )
}
