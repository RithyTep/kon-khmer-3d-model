"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { Suspense, useMemo, useState, useEffect } from "react"
import SceneSetup from "./scene-setup"
import ModelComponent from "./model-component"
import LoadingPlaceholder from "./loading-placeholder"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function ModelViewer({ modelUrl }: { modelUrl: string | null }) {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [isCanvasReady, setIsCanvasReady] = useState(false)

  // Wait for canvas to be ready to prevent hydration issues
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCanvasReady(true)
    }, 200) // Slightly longer delay to ensure everything is loaded
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
      autoRotateSpeed: isMobile ? 0.3 : 0.8, // Slower rotation on mobile
      enableDamping: true,
      dampingFactor: 0.05,
    }),
    [isMobile],
  )

  // Use default model if no URL provided
  const effectiveModelUrl = modelUrl || "/models/model.glb"

  if (!isCanvasReady) {
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
        dpr={isMobile ? 1 : Math.min(window.devicePixelRatio, 2)}
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
