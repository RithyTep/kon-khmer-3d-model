"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import Background3DLoader from "./background-3d-loader"

interface CambodianLoadingProps {
  isVisible: boolean
  onComplete?: () => void
}

export default function CambodianLoading({ isVisible, onComplete }: CambodianLoadingProps) {
  const [progress, setProgress] = useState(0)
  const [particles, setParticles] = useState<
    Array<{ id: number; left: number; top: number; delay: number; duration: number }>
  >([])

  // Create particles on mount
  useEffect(() => {
    const particleCount = 30 // Reduced since we have 3D background
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 6,
      duration: Math.random() * 4 + 4,
    }))
    setParticles(newParticles)
  }, [])

  // Simulate loading progress
  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 12
        if (newProgress >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            onComplete?.()
          }, 1000)
          return 100
        }
        return newProgress
      })
    }, 300)

    return () => clearInterval(interval)
  }, [isVisible, onComplete])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden transition-opacity duration-1000",
        "bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#000000]",
      )}
    >
      {/* 3D Background */}
      <Background3DLoader />

      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 z-10" />

      {/* 2D particles overlay */}
      <div className="absolute inset-0 z-20">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-cyan-400/40 rounded-full animate-float"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-30 text-center">
        {/* Cambodian Flag */}
        <div className="w-72 h-48 lg:w-80 lg:h-52 mx-auto mb-10 relative rounded-xl overflow-hidden shadow-2xl animate-flag-pulse backdrop-blur-sm bg-black/20 border border-white/10">
          {/* Top blue stripe */}
          <div className="h-1/3 bg-[#032ea1] animate-slide-in-top" />

          {/* Red stripe with Angkor Wat */}
          <div className="h-1/3 bg-[#e4002b] flex items-center justify-center animate-slide-in-center">
            <svg
              className="w-16 h-10 lg:w-20 lg:h-12 fill-white animate-temple-glow"
              viewBox="0 0 100 60"
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: "drop-shadow(0 0 12px rgba(255, 255, 255, 0.8))" }}
            >
              {/* Central tower */}
              <rect x="45" y="20" width="10" height="40" />
              <polygon points="45,20 50,10 55,20" />

              {/* Side towers */}
              <rect x="30" y="30" width="8" height="30" />
              <polygon points="30,30 34,22 38,30" />

              <rect x="62" y="30" width="8" height="30" />
              <polygon points="62,30 66,22 70,30" />

              {/* Outer towers */}
              <rect x="18" y="35" width="6" height="25" />
              <polygon points="18,35 21,30 24,35" />

              <rect x="76" y="35" width="6" height="25" />
              <polygon points="76,35 79,30 82,35" />

              {/* Base */}
              <rect x="15" y="55" width="70" height="5" />
            </svg>
          </div>

          {/* Bottom blue stripe */}
          <div className="h-1/3 bg-[#032ea1] animate-slide-in-bottom" />
        </div>

        {/* Loading text with enhanced glow */}
        <h1 className="text-white text-2xl lg:text-3xl font-light mb-2 animate-text-fade drop-shadow-2xl">
          ព្រះរាជាណាចក្រកម្ពុជា
        </h1>
        <p className="text-cyan-300/90 text-sm lg:text-base mb-2 tracking-[2px] uppercase drop-shadow-lg">
          Kingdom of Cambodia
        </p>
        <p className="text-white/60 text-xs lg:text-sm mb-8 tracking-wide">កូនខ្មែរ AI 3D Model Generator</p>

        {/* Enhanced progress bar */}
        <div className="w-72 lg:w-80 h-2 bg-black/40 backdrop-blur-sm rounded-full overflow-hidden mb-6 mx-auto border border-cyan-400/20">
          <div
            className="h-full bg-gradient-to-r from-[#032ea1] via-[#00ffff] via-[#e4002b] to-[#032ea1] bg-[length:200%_100%] rounded-full transition-all duration-500 animate-progress-shimmer shadow-lg shadow-cyan-400/30"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress percentage */}
        <div className="text-cyan-300 text-sm mb-4 font-mono">{Math.round(progress)}%</div>

        {/* Enhanced loading dots */}
        <div className="flex justify-center gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-dot-bounce shadow-lg shadow-cyan-400/50"
              style={{ animationDelay: `${-0.32 + i * 0.16}s` }}
            />
          ))}
        </div>

        {/* Loading status text */}
        <div className="mt-6 text-white/70 text-xs lg:text-sm">
          <div className="animate-pulse">
            {progress < 30 && "Initializing 3D Environment..."}
            {progress >= 30 && progress < 60 && "Loading AI Models..."}
            {progress >= 60 && progress < 90 && "Preparing Interface..."}
            {progress >= 90 && "Almost Ready..."}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.4; }
          50% { transform: translateY(-15px) rotate(180deg); opacity: 0.8; }
        }
        
        @keyframes flag-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        
        @keyframes slide-in-top {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        
        @keyframes slide-in-center {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        
        @keyframes slide-in-bottom {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        
        @keyframes temple-glow {
          0%, 100% { filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.8)); }
          50% { filter: drop-shadow(0 0 20px rgba(0, 255, 255, 0.9)); }
        }
        
        @keyframes text-fade {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        
        @keyframes progress-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.6; }
          40% { transform: scale(1.3); opacity: 1; }
        }
        
        .animate-float {
          animation: float 6s infinite ease-in-out;
        }
        
        .animate-flag-pulse {
          animation: flag-pulse 4s infinite ease-in-out;
        }
        
        .animate-slide-in-top {
          animation: slide-in-top 2s ease-out;
        }
        
        .animate-slide-in-center {
          animation: slide-in-center 2s ease-out 0.3s both;
        }
        
        .animate-slide-in-bottom {
          animation: slide-in-bottom 2s ease-out 0.6s both;
        }
        
        .animate-temple-glow {
          animation: temple-glow 3s infinite ease-in-out 1s;
        }
        
        .animate-text-fade {
          animation: text-fade 3s infinite ease-in-out;
        }
        
        .animate-progress-shimmer {
          animation: progress-shimmer 2s infinite linear;
        }
        
        .animate-dot-bounce {
          animation: dot-bounce 1.4s infinite ease-in-out both;
        }
      `}</style>
    </div>
  )
}
