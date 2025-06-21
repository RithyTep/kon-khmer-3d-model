"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface OptionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  options: {
    condition_mode: "concat" | "fuse"
    quality: "high" | "medium" | "low" | "extra-low"
    geometry_file_format: "glb" | "usdz" | "fbx" | "obj" | "stl"
    use_hyper: boolean
    tier: "Regular" | "Sketch"
    TAPose: boolean
    material: "PBR" | "Shaded"
  }
  onOptionsChange: (options: any) => void
}

export default function OptionsDialog({ open, onOpenChange, options, onOptionsChange }: OptionsDialogProps) {
  const [localOptions, setLocalOptions] = useState(options)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Update local options when props change
  useEffect(() => {
    setLocalOptions(options)
  }, [options])

  const handleChange = (key: string, value: any) => {
    setLocalOptions((prev) => {
      const updated = { ...prev, [key]: value }
      onOptionsChange(updated)
      return updated
    })
  }

  // Add this helper function at the top of the component, before the return statement
  const getQualityTimeEstimate = (quality: string) => {
    const estimates = {
      "extra-low": "30-45s",
      low: "45-60s",
      medium: "60-90s",
      high: "90-120s",
    }
    return estimates[quality as keyof typeof estimates] || "60-90s"
  }

  const getTierTimeEstimate = (tier: string) => {
    return tier === "Regular" ? "+20% time" : "Faster"
  }

  const content = (
    <div className="py-2">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="basic" className="tracking-normal">
            ការកំណត់មូលដ្ឋាន
          </TabsTrigger>
          <TabsTrigger value="advanced" className="tracking-normal">
            កម្រិតខ្ពស់
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white font-mono tracking-normal">គុណភាព</Label>
              <Select value={localOptions.quality} onValueChange={(value) => handleChange("quality", value)}>
                <SelectTrigger className="bg-black border-[rgba(255,255,255,0.12)] text-white tracking-normal">
                  <SelectValue placeholder="ជ្រើសរើសគុណភាព" />
                </SelectTrigger>
                <SelectContent className="bg-black border-[rgba(255,255,255,0.12)] text-white">
                  <SelectItem value="high" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    <div className="flex justify-between items-center w-full">
                      <span>ខ្ពស់ (50k)</span>
                      <span className="text-xs text-gray-400 ml-2">90-120s</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    <div className="flex justify-between items-center w-full">
                      <span>មធ្យម (18k)</span>
                      <span className="text-xs text-gray-400 ml-2">60-90s</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="low" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    <div className="flex justify-between items-center w-full">
                      <span>ទាប (8k)</span>
                      <span className="text-xs text-gray-400 ml-2">45-60s</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="extra-low" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    <div className="flex justify-between items-center w-full">
                      <span>ទាបបំផុត (4k)</span>
                      <span className="text-xs text-gray-400 ml-2">30-45s</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">ពេលវេលាប៉ាន់ស្មាន: {getQualityTimeEstimate(localOptions.quality)}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-white font-mono tracking-normal">ទម្រង់</Label>
              <Select
                value={localOptions.geometry_file_format}
                onValueChange={(value) => handleChange("geometry_file_format", value)}
              >
                <SelectTrigger className="bg-black border-[rgba(255,255,255,0.12)] text-white tracking-normal">
                  <SelectValue placeholder="ជ្រើសរើសទម្រង់" />
                </SelectTrigger>
                <SelectContent className="bg-black border-[rgba(255,255,255,0.12)] text-white">
                  <SelectItem value="glb" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    GLB
                  </SelectItem>
                  <SelectItem value="usdz" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    USDZ
                  </SelectItem>
                  <SelectItem value="fbx" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    FBX
                  </SelectItem>
                  <SelectItem value="obj" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    OBJ
                  </SelectItem>
                  <SelectItem value="stl" className="tracking-normal hover:bg-[#111111] focus:bg-[#111111]">
                    STL
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm border-[rgba(255,255,255,0.12)] bg-black/50">
              <div>
                <Label className="text-white font-mono tracking-normal">ប្រើ Hyper</Label>
                <p className="text-gray-400 text-xs tracking-normal">លម្អិតប្រសើរ</p>
              </div>
              <Switch
                checked={localOptions.use_hyper}
                onCheckedChange={(checked) => handleChange("use_hyper", checked)}
              />
            </div>

            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm border-[rgba(255,255,255,0.12)] bg-black/50">
              <div>
                <Label className="text-white font-mono tracking-normal">ទម្រង់ T/A</Label>
                <p className="text-gray-400 text-xs tracking-normal">សម្រាប់មនុស្ស</p>
              </div>
              <Switch checked={localOptions.TAPose} onCheckedChange={(checked) => handleChange("TAPose", checked)} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white font-mono tracking-normal">របៀបលក្ខខណ្ឌ</Label>
            <RadioGroup
              value={localOptions.condition_mode}
              onValueChange={(value) => handleChange("condition_mode", value)}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="concat" id="concat" className="border-white text-white" />
                <Label htmlFor="concat" className="text-white tracking-normal">
                  Concat (វត្ថុតែមួយ, ទិដ្ឋភាពច្រើន)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fuse" id="fuse" className="border-white text-white" />
                <Label htmlFor="fuse" className="text-white tracking-normal">
                  Fuse (វត្ថុច្រើន)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-white font-mono tracking-normal">សម្ភារៈ</Label>
            <RadioGroup
              value={localOptions.material}
              onValueChange={(value) => handleChange("material", value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PBR" id="pbr" className="border-white text-white" />
                <Label htmlFor="pbr" className="text-white tracking-normal">
                  PBR
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Shaded" id="shaded" className="border-white text-white" />
                <Label htmlFor="shaded" className="text-white tracking-normal">
                  Shaded
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-white font-mono tracking-normal">កម្រិតបង្កើត</Label>
            <RadioGroup
              value={localOptions.tier}
              onValueChange={(value) => handleChange("tier", value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Regular" id="regular" className="border-white text-white" />
                <Label htmlFor="regular" className="text-white tracking-normal">
                  <div>
                    <div>ធម្មតា (គុណភាព)</div>
                    <div className="text-xs text-gray-400">+20% ពេលវេលា</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Sketch" id="sketch" className="border-white text-white" />
                <Label htmlFor="sketch" className="text-white tracking-normal">
                  <div>
                    <div>គំនូរព្រាង (ល្បឿន)</div>
                    <div className="text-xs text-gray-400">លឿនជាង</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="mt-6 p-3 bg-black/30 rounded-lg border border-white/10">
            <div className="text-center">
              <p className="text-white text-sm font-medium mb-1">ពេលវេលាប៉ាន់ស្មាន</p>
              <p className="text-cyan-400 text-lg font-mono">{getQualityTimeEstimate(localOptions.quality)}</p>
              <p className="text-xs text-gray-400 mt-1">
                {localOptions.tier === "Regular" ? "គុណភាពខ្ពស់ (+20% ពេលវេលា)" : "ល្បឿនលឿន"}
                {localOptions.use_hyper && " • Hyper Mode (+30% ពេលវេលា)"}
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-black border-[rgba(255,255,255,0.12)] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-white font-mono tracking-normal">ជម្រើស</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-black border-t border-[rgba(255,255,255,0.12)] text-white">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle className="text-xl text-white font-mono tracking-normal">ជម្រើស</DrawerTitle>
          </DrawerHeader>
          <div className="px-4">{content}</div>
          <DrawerFooter>
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-gray-800 hover:bg-gray-700 text-white tracking-normal"
            >
              អនុវត្តការកំណត់
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
