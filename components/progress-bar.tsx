"use client"

import { cn } from "@/lib/utils"

interface ProgressBarProps {
  totalTasks: number
  completedTasks: number
  className?: string
  isIndeterminate?: boolean
}

export default function ProgressBar({
  totalTasks,
  completedTasks,
  className,
  isIndeterminate = false,
}: ProgressBarProps) {
  const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div
      className={cn("w-full bg-black/50 rounded-full overflow-hidden border border-white/20 shadow-inner", className)}
    >
      {isIndeterminate ? (
        <div className="h-full relative w-full">
          <div className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 absolute w-[50%] animate-progress-indeterminate rounded-full neon-glow shadow-lg" />
        </div>
      ) : (
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 transition-all duration-700 rounded-full neon-glow shadow-lg"
          style={{ width: `${percentage}%` }}
        />
      )}
    </div>
  )
}
