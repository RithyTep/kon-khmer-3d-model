"use client"

import dynamic from "next/dynamic"

// Dynamically import the Rodin component with SSR disabled
const Rodin = dynamic(() => import("@/components/rodin"), {
  ssr: false,
  loading: () => (
    <div className="h-[100dvh] w-screen overflow-hidden bg-black bg-radial-gradient flex items-center justify-center">
      <div className="glass-strong rounded-xl p-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="loading-spinner"></div>
          <div className="text-center">
            <h2 className="text-xl text-white font-semibold mb-2">កូនខ្មែរ AI 3D Model</h2>
            <p className="text-gray-400">ដំណើរការដោយ Rithy Tep</p>
          </div>
        </div>
      </div>
    </div>
  ),
})

export default function RodinClient() {
  return <Rodin />
}
