"use client"

import dynamic from "next/dynamic"

const Rodin = dynamic(() => import("@/components/rodin"), {
  ssr: false,
  loading: () => (
    <div className="h-[100dvh] w-screen overflow-hidden bg-black bg-radial-gradient flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  ),
})

export default function RodinClient() {
  return <Rodin />
}
