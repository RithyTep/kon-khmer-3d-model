"use client"

import { useState, useEffect } from "react"
import { ExternalLink, Download, ArrowLeft, Sparkles, Zap } from "lucide-react"
import type { FormValues } from "@/lib/form-schema"
import { submitRodinJob, checkJobStatus, downloadModel } from "@/lib/api-service"
import ModelViewer from "./model-viewer"
import Form from "./form"
import StatusIndicator from "./status-indicator"
import OptionsDialog from "./options-dialog"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function Rodin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [modelUrl, setModelUrl] = useState<string | null>("/models/model.glb")
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [jobStatuses, setJobStatuses] = useState<Array<{ uuid: string; status: string }>>([])
  const [showOptions, setShowOptions] = useState(false)
  const [showPromptContainer, setShowPromptContainer] = useState(false)
  const [isDefaultModel, setIsDefaultModel] = useState(true)
  const [isAppReady, setIsAppReady] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const isMobile = useMediaQuery("(max-width: 768px)")

  const [options, setOptions] = useState({
    condition_mode: "concat" as const,
    quality: "medium" as const,
    geometry_file_format: "glb" as const,
    use_hyper: false,
    tier: "Regular" as const,
    TAPose: false,
    material: "PBR" as const,
  })

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Prevent body scroll on mobile
  useEffect(() => {
    if (!isClient) return

    if (isMobile && typeof document !== "undefined") {
      document.body.style.overflow = "hidden"
      document.documentElement.style.overflow = "hidden"

      return () => {
        document.body.style.overflow = ""
        document.documentElement.style.overflow = ""
      }
    }
  }, [isMobile, isClient])

  // Initialize app with delay to prevent flickering
  useEffect(() => {
    if (!isClient) return

    const timer = setTimeout(() => {
      setIsAppReady(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [isClient])

  const handleOptionsChange = (newOptions: any) => {
    setOptions(newOptions)
  }

  async function handleStatusCheck(subscriptionKey: string, taskUuid: string) {
    try {
      setIsPolling(true)

      const data = await checkJobStatus(subscriptionKey)
      console.log("Status response:", data)

      if (!data.jobs || !Array.isArray(data.jobs) || data.jobs.length === 0) {
        throw new Error("No jobs found in status response")
      }

      setJobStatuses(data.jobs)

      const allJobsDone = data.jobs.every((job: any) => job.status === "Done")
      const anyJobFailed = data.jobs.some((job: any) => job.status === "Failed")

      if (allJobsDone) {
        setIsPolling(false)

        try {
          const downloadData = await downloadModel(taskUuid)
          console.log("Download response:", downloadData)

          if (downloadData.error && downloadData.error !== "OK") {
            throw new Error(`Download error: ${downloadData.error}`)
          }

          if (downloadData.list && downloadData.list.length > 0) {
            const glbFile = downloadData.list.find((file: { name: string }) => file.name.toLowerCase().endsWith(".glb"))

            if (glbFile) {
              const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(glbFile.url)}`
              setModelUrl(proxyUrl)
              setDownloadUrl(glbFile.url)
              setIsLoading(false)
              setShowPromptContainer(false)
              setIsDefaultModel(false)
            } else {
              setError("រកមិនឃើញឯកសារ GLB ក្នុងលទ្ធផល")
              setIsLoading(false)
            }
          } else {
            setError("គ្មានឯកសារសម្រាប់ទាញយក")
            setIsLoading(false)
          }
        } catch (downloadErr) {
          setError(`Failed to download model: ${downloadErr instanceof Error ? downloadErr.message : "Unknown error"}`)
          setIsLoading(false)
        }
      } else if (anyJobFailed) {
        setIsPolling(false)
        setError("កិច្ចការបង្កើតបានបរាជ័យ")
        setIsLoading(false)
      } else {
        setTimeout(() => handleStatusCheck(subscriptionKey, taskUuid), 3000)
      }
    } catch (err) {
      setError("បរាជ័យក្នុងការពិនិត្យស្ថានភាព")
      setIsPolling(false)
      setIsLoading(false)
    }
  }

  async function handleSubmit(values: FormValues) {
    setIsLoading(true)
    setError(null)
    setResult(null)
    setModelUrl(null)
    setDownloadUrl(null)
    setJobStatuses([])
    setIsDefaultModel(false)

    try {
      const formData = new FormData()

      if (values.images && values.images.length > 0) {
        values.images.forEach((image) => {
          formData.append("images", image)
        })
      }

      if (values.prompt) {
        formData.append("prompt", values.prompt)
      }

      formData.append("condition_mode", options.condition_mode)
      formData.append("geometry_file_format", options.geometry_file_format)
      formData.append("material", options.material)
      formData.append("quality", options.quality)
      formData.append("use_hyper", options.use_hyper.toString())
      formData.append("tier", options.tier)
      formData.append("TAPose", options.TAPose.toString())
      formData.append("mesh_mode", "Quad")
      formData.append("mesh_simplify", "true")
      formData.append("mesh_smooth", "true")

      const data = await submitRodinJob(formData)
      console.log("Generation response:", data)

      setResult(data)

      if (data.jobs && data.jobs.subscription_key && data.uuid) {
        handleStatusCheck(data.jobs.subscription_key, data.uuid)
      } else {
        setError("Missing required data for status checking")
        setIsLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (downloadUrl && typeof window !== "undefined") {
      window.open(downloadUrl, "_blank")
    }
  }

  const handleBack = () => {
    setShowPromptContainer(true)
    setModelUrl("/models/model.glb")
    setIsDefaultModel(true)
  }

  const handleStartGeneration = () => {
    setShowPromptContainer(true)
  }

  const ExternalLinks = () => (
    <div className="flex items-center space-x-4 lg:space-x-6">
      <a
        href="https://github.com/rithyTep/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center text-white/80 hover:text-gray-200 transition-all duration-300 text-sm lg:text-base group"
      >
        <span className="mr-2 group-hover:text-gray-200 transition-colors">គេហទំព័រ</span>
        <ExternalLink className="h-3 w-3 lg:h-4 lg:w-4 group-hover:scale-110 transition-transform" />
      </a>
    </div>
  )

  // Don't render anything until we're on the client and app is ready
  if (!isClient || !isAppReady) {
    return (
      <div className="loading-screen">
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
    )
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden tech-grid bg-black">
      {/* Full-screen canvas */}
      <div className="absolute inset-0 z-0">
        <ModelViewer modelUrl={modelUrl} />
      </div>

      {/* Overlay UI */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Header Section */}
        <div className="absolute top-0 left-0 right-0 p-4 lg:p-6 pointer-events-auto">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
            {/* Logo Section */}
            <div className="bg-gray-900/70 backdrop-blur-md rounded-2xl p-4 lg:p-6 max-w-md lg:max-w-lg border border-gray-700">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gray-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                </div>
                <h1 className="text-xl lg:text-3xl text-white font-bold tracking-tight">កូនខ្មែរ AI 3D Model</h1>
              </div>
              <div className="space-y-1">
                <p className="text-gray-300 text-xs lg:text-sm font-medium flex items-center">
                  <Zap className="w-3 h-3 lg:w-4 lg:h-4 mr-1 text-gray-300" />
                  ដំណើរការដោយ Rithy Tep
                </p>
                <p className="text-gray-500 text-xs">Version 1.0.0</p>
              </div>
            </div>

            {/* Links Section - Desktop */}
            {!isMobile && (
              <div className="bg-gray-900/70 backdrop-blur-md rounded-xl p-4 border border-gray-700">
                <ExternalLinks />
              </div>
            )}
          </div>
        </div>

        {/* Loading indicator */}
        <StatusIndicator isLoading={isLoading} jobStatuses={jobStatuses} />

        {/* Error message */}
        {error && (
          <div className="absolute top-32 lg:top-40 left-1/2 transform -translate-x-1/2 max-w-sm lg:max-w-md mx-4 pointer-events-auto">
            <div className="bg-red-900/20 backdrop-blur-md rounded-xl p-4 border border-red-500/30">
              <p className="text-red-300 text-sm lg:text-base text-center">{error}</p>
            </div>
          </div>
        )}

        {/* Model controls when model is loaded */}
        {!isLoading && modelUrl && !showPromptContainer && (
          <div className="absolute bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
            <div className="flex items-center gap-3 lg:gap-4">
              {isDefaultModel ? (
                <Button
                  onClick={handleStartGeneration}
                  className="bg-gray-800/70 backdrop-blur-md hover:bg-gray-700/70 text-white rounded-2xl px-6 lg:px-8 py-3 lg:py-4 flex items-center gap-3 text-base lg:text-lg font-medium transition-all duration-300 hover:scale-105 border border-gray-600"
                >
                  <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  <span>ចាប់ផ្តើមបង្កើត 3D Model</span>
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleBack}
                    className="bg-gray-900/70 backdrop-blur-md hover:bg-gray-800/70 text-white border border-gray-700 rounded-xl px-4 lg:px-6 py-2 lg:py-3 flex items-center gap-2 transition-all duration-300 hover:scale-105"
                  >
                    <ArrowLeft className="h-4 w-4 lg:h-5 lg:w-5" />
                    <span className="text-sm lg:text-base">ត្រលប់ក្រោយ</span>
                  </Button>

                  <Button
                    onClick={handleDownload}
                    className="bg-gray-700 hover:bg-gray-600 text-white rounded-xl px-4 lg:px-6 py-2 lg:py-3 flex items-center gap-2 transition-all duration-300 hover:scale-105 border border-gray-600"
                  >
                    <Download className="h-4 w-4 lg:h-5 lg:w-5" />
                    <span className="text-sm lg:text-base font-medium">ទាញយក</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Input field at bottom */}
        {showPromptContainer && (
          <div className="absolute bottom-4 lg:bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-sm lg:max-w-4xl px-4 pointer-events-auto">
            <Form isLoading={isLoading} onSubmit={handleSubmit} onOpenOptions={() => setShowOptions(true)} />

            {/* Links below prompt on mobile */}
            {isMobile && (
              <div className="mt-4 flex justify-center">
                <div className="bg-gray-900/70 backdrop-blur-md rounded-xl p-3 border border-gray-700">
                  <ExternalLinks />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Options Dialog/Drawer */}
      <OptionsDialog
        open={showOptions}
        onOpenChange={setShowOptions}
        options={options}
        onOptionsChange={handleOptionsChange}
      />
    </div>
  )
}
