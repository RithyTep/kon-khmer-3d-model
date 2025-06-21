"use client"

import type React from "react"

import { useState, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type * as z from "zod"
import { Form as UIForm } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { ImageIcon, SlidersHorizontal, ArrowUp, Sparkles } from "lucide-react"
import AutoResizeTextarea from "./auto-resize-textarea"
import ImageUploadArea from "./image-upload-area"
import { formSchema } from "@/lib/form-schema"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

interface FormProps {
  isLoading: boolean
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>
  onOpenOptions: () => void
}

export default function Form({ isLoading, onSubmit, onOpenOptions }: FormProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropAreaRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const dragCounter = useRef(0)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      images: [],
      condition_mode: "concat",
      quality: "medium",
      geometry_file_format: "glb",
      use_hyper: false,
      tier: "Regular",
      TAPose: false,
      material: "PBR",
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    addImages(files)
  }

  const addImages = (files: File[]) => {
    if (files.length === 0) return

    const currentImages = form.getValues("images") || []
    const totalImages = currentImages.length + files.length

    if (totalImages > 5) {
      setError("អ្នកអាចបញ្ចូលរូបភាពបានអតិបរមា 5 រូប")
      const allowedNewImages = 5 - currentImages.length
      files = files.slice(0, allowedNewImages)

      if (files.length === 0) return
    }

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file))
    const updatedImages = [...currentImages, ...files]

    setPreviewUrls([...previewUrls, ...newPreviewUrls])
    form.setValue("images", updatedImages)
  }

  const removeImage = (index: number) => {
    const currentImages = form.getValues("images") || []
    const newImages = [...currentImages]
    newImages.splice(index, 1)

    const newPreviewUrls = [...previewUrls]
    URL.revokeObjectURL(newPreviewUrls[index])
    newPreviewUrls.splice(index, 1)

    setPreviewUrls(newPreviewUrls)
    form.setValue("images", newImages)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current += 1
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current -= 1
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current = 0
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))
      addImages(files)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (!isMobile && !e.shiftKey) {
        e.preventDefault()
        formRef.current?.requestSubmit()
      }
    }
  }

  return (
    <UIForm {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="relative">
        <div
          ref={dropAreaRef}
          className={cn(
            "relative glass-strong rounded-3xl overflow-hidden transition-all duration-300 shadow-2xl border",
            isDragging ? "border-cyan-400 neon-glow scale-105" : isFocused ? "border-cyan-400/50" : "border-white/10",
            isLoading && "pulse-tech pointer-events-none opacity-70",
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Image previews */}
          <ImageUploadArea previewUrls={previewUrls} onRemoveImage={removeImage} isLoading={isLoading} />

          <div className="px-3 lg:px-4 py-2 lg:py-3">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={triggerFileInput}
                  className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-xl h-10 w-10 lg:h-12 lg:w-12 transition-all duration-300 hover:scale-110"
                  disabled={isLoading}
                >
                  <ImageIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onOpenOptions}
                  className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-xl h-10 w-10 lg:h-12 lg:w-12 transition-all duration-300 hover:scale-110"
                  disabled={isLoading}
                >
                  <SlidersHorizontal className="h-4 w-4 lg:h-5 lg:w-5" />
                </Button>
              </div>

              <AutoResizeTextarea
                placeholder="បង្កើតម៉ូដែល 3D"
                className="flex-1 bg-transparent border-0 focus:ring-0 text-white placeholder:text-gray-400 py-2 lg:py-3 px-3 lg:px-4 resize-none text-sm lg:text-base font-medium"
                {...form.register("prompt")}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />

              <div>
          <Button
  type="submit"
  className="bg-white from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black rounded-xl h-10 w-10 lg:h-12 lg:w-12 p-0 flex items-center justify-center transition-all duration-300 hover:scale-105 neon-glow"
  disabled={isLoading}
>
  {isLoading ? (
    <Sparkles className="h-4 w-4 lg:h-5 lg:w-5 animate-spin" />
  ) : (
    <ArrowUp className="h-4 w-4 lg:h-5 lg:w-5" />
  )}
</Button>

              </div>
            </div>
          </div>

          {isDragging && (
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center pointer-events-none z-10 backdrop-blur-sm">
              <div className="text-center">
                <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 flex items-center justify-center neon-glow">
                  <ImageIcon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                </div>
                <p className="text-white font-medium text-base lg:text-lg">ទម្លាក់រូបភាពនៅទីនេះ</p>
                <p className="text-gray-400 text-sm mt-1">អតិបរមា 5 រូបភាព</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-3 glass-strong rounded-xl p-3 border-red-500/30 bg-red-900/20">
            <p className="text-red-300 text-sm text-center">{error}</p>
          </div>
        )}
      </form>
    </UIForm>
  )
}
