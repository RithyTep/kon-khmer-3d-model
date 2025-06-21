"use client"

import { useEffect, useState, useMemo } from "react"
import { useThree } from "@react-three/fiber"
import { useGLTF, Center } from "@react-three/drei"
import LoadingSpinner from "./loading-spinner"
import { useMediaQuery } from "@/hooks/use-media-query"

interface ModelComponentProps {
  url: string
  scale?: number
}

export default function ModelComponent({ url, scale }: ModelComponentProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { camera } = useThree()

  // Calculate responsive scale
  const responsiveScale = useMemo(() => {
    const baseScale = scale || 1
    const mobileScale = isMobile ? 0.6 : 1 // Make model 60% size on mobile
    return baseScale * mobileScale * 1.5
  }, [scale, isMobile])

  // Load model with error handling
  const gltf = useGLTF(url, undefined, undefined, (error) => {
    console.error("Error loading model:", error)
    setHasError(true)
    setIsLoading(false)
  })

  useEffect(() => {
    // Adjust camera position based on device
    if (typeof window !== "undefined") {
      const cameraDistance = isMobile ? 8 : 5
      camera.position.set(0, 0, cameraDistance)
    }
  }, [url, camera, isMobile])

  useEffect(() => {
    if (gltf && gltf.scene) {
      setIsLoading(false)
      setHasError(false)
    }
  }, [gltf])

  if (isLoading && !hasError) {
    return <LoadingSpinner />
  }

  if (hasError || !gltf || !gltf.scene) {
    return <FallbackModel scale={responsiveScale} />
  }

  return (
    <Center>
      <primitive object={gltf.scene} scale={responsiveScale} />
    </Center>
  )
}

// Fallback component when model fails to load
function FallbackModel({ scale }: { scale: number }) {
  return (
    <Center>
      <group scale={scale}>
        {/* Simple geometric shapes as fallback */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#00ffff" wireframe={false} />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#ff00ff" wireframe={false} />
        </mesh>
        <mesh position={[0, -1.5, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
          <meshStandardMaterial color="#ffff00" wireframe={false} />
        </mesh>
      </group>
    </Center>
  )
}

// Preload the default model
useGLTF.preload("/models/model.glb")
