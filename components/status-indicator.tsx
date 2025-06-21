"use client"

import ProgressBar from "./progress-bar"
import { Loader2, Sparkles, Clock } from "lucide-react"

interface StatusIndicatorProps {
  isLoading: boolean
  jobStatuses: Array<{ uuid: string; status: string }>
  estimatedTime?: number // in seconds
  elapsedTime?: number // in seconds
}

export default function StatusIndicator({
  isLoading,
  jobStatuses,
  estimatedTime = 0,
  elapsedTime = 0,
}: StatusIndicatorProps) {
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

  // Calculate remaining time
  const remainingTime = Math.max(0, estimatedTime - elapsedTime)
  const progressPercentage = estimatedTime > 0 ? Math.min(100, (elapsedTime / estimatedTime) * 100) : 0

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    if (mins > 0) {
      return `${mins}m ${secs}s`
    }
    return `${secs}s`
  }

  // Get status message based on progress
  const getStatusMessage = () => {
    if (actualTasks === 0) {
      return "កំពុងចាប់ផ្តើម..."
    }

    const processingJobs = jobStatuses.filter((job) => job.status === "Processing").length
    const queuedJobs = jobStatuses.filter((job) => job.status === "Queued").length

    if (processingJobs > 0) {
      return "កំពុងបង្កើតម៉ូដែល 3D..."
    } else if (queuedJobs > 0) {
      return "កំពុងរង់ចាំក្នុងជួរ..."
    } else if (completedJobTasks === actualTasks) {
      return "កំពុងបញ្ចប់..."
    }

    return "កំពុងដំណើរការ..."
  }

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      <div className="glass-strong rounded-3xl p-8 lg:p-12 max-w-md lg:max-w-xl mx-4 shadow-2xl border border-cyan-400/20">
        <div className="text-center space-y-6 lg:space-y-8">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="w-20 h-20 lg:w-28 lg:h-28 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 flex items-center justify-center neon-glow shadow-2xl">
                <Sparkles className="w-10 h-10 lg:w-14 lg:h-14 text-white animate-pulse" />
              </div>
              <Loader2 className="absolute inset-0 w-20 h-20 lg:w-28 lg:h-28 text-cyan-400 animate-spin" />

              {/* Additional rotating ring */}
              <div
                className="absolute inset-0 w-20 h-20 lg:w-28 lg:h-28 border-2 border-transparent border-t-cyan-300 border-r-blue-400 rounded-full animate-spin"
                style={{ animationDuration: "3s", animationDirection: "reverse" }}
              />
            </div>
          </div>

          <div className="space-y-3 lg:space-y-4">
            <h3 className="text-white font-semibold text-2xl lg:text-3xl tracking-wide">កំពុងបង្កើត...</h3>
            <p className="text-gray-300 text-base lg:text-lg font-medium">{getStatusMessage()}</p>
          </div>

          <div className="w-full max-w-sm lg:max-w-md mx-auto space-y-4 lg:space-y-5">
            {/* Main progress bar */}
            <ProgressBar
              totalTasks={totalTasks}
              completedTasks={completedTasks}
              isIndeterminate={isIndeterminate}
              className="h-3 lg:h-4"
            />

            {/* Time-based progress bar when we have estimate */}
            {estimatedTime > 0 && (
              <div className="space-y-3">
                <div className="w-full bg-black/50 rounded-full overflow-hidden border border-white/20 h-2.5 lg:h-3">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-600 transition-all duration-1000 rounded-full shadow-lg"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-center gap-3 text-sm lg:text-base text-gray-300">
                  <Clock className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="font-mono">
                    {remainingTime > 0 ? `${formatTime(remainingTime)} នៅសល់` : "ជិតបញ្ចប់..."}
                  </span>
                </div>
              </div>
            )}

            {showProgress && (
              <div className="bg-black/30 rounded-xl p-3 lg:p-4 border border-white/10">
                <p className="text-sm lg:text-base text-gray-300 font-medium">
                  {completedTasks}/{totalTasks} ការងារបានបញ្ចប់
                </p>
                <div className="flex justify-center mt-2">
                  <div className="flex space-x-1">
                    {Array.from({ length: totalTasks }, (_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full transition-all duration-500 ${
                          i < completedTasks ? "bg-green-400 shadow-lg shadow-green-400/50" : "bg-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Animated dots */}
          <div className="flex justify-center gap-2 lg:gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 lg:w-4 lg:h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-dot-bounce shadow-lg shadow-cyan-400/50"
                style={{ animationDelay: `${-0.32 + i * 0.16}s` }}
              />
            ))}
          </div>

          {/* Additional status info */}
          <div className="mt-4 lg:mt-6 text-white/60 text-sm lg:text-base">
            <div className="animate-pulse">
              {estimatedTime > 0 && (
                <div className="bg-black/20 rounded-lg p-3 lg:p-4 border border-white/5">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">ពេលវេលាប៉ាន់ស្មាន</span>
                  </div>
                  <div className="text-cyan-300 font-mono text-lg lg:text-xl">{formatTime(estimatedTime)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.6; }
          40% { transform: scale(1.3); opacity: 1; }
        }
        
        .animate-dot-bounce {
          animation: dot-bounce 1.4s infinite ease-in-out both;
        }
      `}</style>
    </div>
  )
}
