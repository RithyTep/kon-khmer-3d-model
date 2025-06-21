"use client"

import ProgressBar from "./progress-bar"
import { Loader2, Sparkles } from "lucide-react"

interface StatusIndicatorProps {
  isLoading: boolean
  jobStatuses: Array<{ uuid: string; status: string }>
}

export default function StatusIndicator({ isLoading, jobStatuses }: StatusIndicatorProps) {
  if (!isLoading) {
    return null
  }

  const actualTasks = jobStatuses.length
  const totalTasks = actualTasks > 0 ? actualTasks + 1 : 0

  const completedJobTasks = jobStatuses.filter((job) => job.status === "Done").length
  const initialRequestComplete = actualTasks > 0 ? 1 : 0
  const completedTasks = completedJobTasks + initialRequestComplete

  const showProgress = actualTasks > 0
  const isIndeterminate = actualTasks === 0

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      <div className="glass-strong rounded-2xl p-6 lg:p-8 max-w-sm lg:max-w-md mx-4">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 flex items-center justify-center neon-glow">
                <Sparkles className="w-6 h-6 lg:w-8 lg:h-8 text-white animate-pulse" />
              </div>
              <Loader2 className="absolute inset-0 w-12 h-12 lg:w-16 lg:h-16 text-cyan-400 animate-spin" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-white font-semibold text-lg lg:text-xl">កំពុងបង្កើត...</h3>
            <p className="text-gray-400 text-sm lg:text-base">AI កំពុងដំណើរការម៉ូដែល 3D របស់អ្នក</p>
          </div>

          <div className="w-full max-w-xs mx-auto">
            <ProgressBar
              totalTasks={totalTasks}
              completedTasks={completedTasks}
              isIndeterminate={isIndeterminate}
              className="h-2 lg:h-3"
            />
            {showProgress && (
              <p className="text-xs lg:text-sm text-gray-400 mt-2">
                {completedTasks}/{totalTasks} ការងារបានបញ្ចប់
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
