"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Float, Text3D, Center } from "@react-three/drei"
import { Suspense, useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import type * as THREE from "three"

// Animated 3D geometric shapes for background
function FloatingGeometry({
  position,
  color,
  shape,
}: { position: [number, number, number]; color: string; shape: string }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
      meshRef.current.rotation.y += 0.01
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.3) * 0.5
    }
  })

  const geometry = useMemo(() => {
    switch (shape) {
      case "box":
        return <boxGeometry args={[1, 1, 1]} />
      case "sphere":
        return <sphereGeometry args={[0.6, 32, 32]} />
      case "torus":
        return <torusGeometry args={[0.6, 0.2, 16, 32]} />
      case "octahedron":
        return <octahedronGeometry args={[0.8]} />
      default:
        return <boxGeometry args={[1, 1, 1]} />
    }
  }, [shape])

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        {geometry}
        <meshStandardMaterial
          color={color}
          wireframe={true}
          transparent
          opacity={0.6}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  )
}

// Animated loading text in 3D
function Loading3DText() {
  const textRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (textRef.current) {
      textRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group ref={textRef}>
      <Center>
        <Text3D
          font="/fonts/Geist_Bold.json"
          size={0.8}
          height={0.1}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
        >
          RITHY TEP
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.3} transparent opacity={0.8} />
        </Text3D>
      </Center>
    </group>
  )
}

// Particle system for 3D background
function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null)

  const particleCount = 100
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return pos
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001
      particlesRef.current.rotation.x += 0.0005
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#00ffff" size={0.05} transparent opacity={0.6} sizeAttenuation={true} />
    </points>
  )
}

// Main 3D background scene
function Background3DScene() {
  const geometries = useMemo(
    () => [
      { position: [-4, 2, -2], color: "#00ffff", shape: "box" },
      { position: [4, -1, -3], color: "#ff00ff", shape: "sphere" },
      { position: [-2, -3, 1], color: "#ffff00", shape: "torus" },
      { position: [3, 3, -1], color: "#00ff00", shape: "octahedron" },
      { position: [0, -2, -4], color: "#ff6600", shape: "box" },
      { position: [-3, 1, 2], color: "#6600ff", shape: "sphere" },
    ],
    [],
  )

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#00ffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
      <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={0.5} color="#ffffff" />

      <ParticleField />

      {geometries.map((geo, index) => (
        <FloatingGeometry
          key={index}
          position={geo.position as [number, number, number]}
          color={geo.color}
          shape={geo.shape}
        />
      ))}

      <group position={[0, 0, -2]}>
        <Loading3DText />
      </group>

      <Environment preset="night" />
    </>
  )
}

// 3D Background Loader Component
export default function Background3DLoader() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1}
      >
        <Suspense fallback={null}>
          <Background3DScene />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            enableDamping
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
