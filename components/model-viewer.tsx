"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { Suspense, useMemo, useState, useEffect } from "react"
import SceneSetup from "./scene-setup"
import ModelComponent from "./model-component"
import LoadingPlaceholder from "./loading-placeholder"
import { useMediaQuery } from "@/hooks/use-media-query"
import Background3DLoader from "./background-3d-loader"

export default function ModelViewer({ modelUrl }: { modelUrl: string | null }) {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [isCanvasReady, setIsCanvasReady] = useState(false)
  const [showBackground3D, setShowBackground3D] = useState(false)

  // Wait for canvas to be ready to prevent hydration issues
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCanvasReady(true)
    }, 200)
    return () => clearTimeout(timer)
  }, [])

  // Show 3D background when no model is loaded or loading
  useEffect(() => {
    setShowBackground3D(!modelUrl || modelUrl === "/models/model.glb")
  }, [modelUrl])

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
      autoRotate: showBackground3D ? true : true,
      autoRotateSpeed: showBackground3D ? 0.2 : isMobile ? 0.3 : 0.8,
      enableDamping: true,
      dampingFactor: 0.05,
    }),
    [isMobile, showBackground3D],
  )

  // Use default model if no URL provided
  const effectiveModelUrl = modelUrl || "/models/model.glb"

  if (!isCanvasReady) {
    return (
      <div className="w-full h-[100dvh] bg-black bg-radial-gradient flex items-center justify-center">
        <Background3DLoader />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="glass-strong rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="loading-spinner"></div>
              <span className="text-white text-lg">Loading 3D Environment...</span>
            </div>
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
        <ambientLight intensity={showBackground3D ? 0.4 : 0.3} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          castShadow
          intensity={showBackground3D ? 0.8 : 1}
          color={showBackground3D ? "#00ffff" : "#ffffff"}
        />
        <pointLight
          position={[-10, -10, -10]}
          intensity={showBackground3D ? 0.4 : 0.5}
          color={showBackground3D ? "#ff00ff" : "#ffffff"}
        />

        <Suspense fallback={<LoadingPlaceholder />}>
          {showBackground3D && effectiveModelUrl === "/models/model.glb" ? (
            // Show animated background when default model
            <>
              <ModelComponent url={effectiveModelUrl} scale={1} />
              {/* Add some floating elements around the default model */}
              <group>
                <mesh position={[-3, 2, -2]}>
                  <boxGeometry args={[0.5, 0.5, 0.5]} />
                  <meshStandardMaterial color="#00ffff" wireframe transparent opacity={0.3} />
                </mesh>
                <mesh position={[3, -1, -2]}>
                  <sphereGeometry args={[0.3, 16, 16]} />
                  <meshStandardMaterial color="#ff00ff" wireframe transparent opacity={0.3} />
                </mesh>
                <mesh position={[0, 3, -3]}>
                  <torusGeometry args={[0.4, 0.1, 8, 16]} />
                  <meshStandardMaterial color="#ffff00" wireframe transparent opacity={0.3} />
                </mesh>
              </group>
            </>
          ) : (
            <ModelComponent url={effectiveModelUrl} scale={1} />
          )}
        </Suspense>

        <OrbitControls {...orbitSettings} />
        <Environment preset={showBackground3D ? "night" : "studio"} />
      </Canvas>
    </div>
  )
}
