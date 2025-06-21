import { NextResponse } from "next/server"

const API_KEY = "vibecoding" // Public API key

export async function POST(request: Request) {
  try {
    // Get the form data from the request
    const formData = await request.formData()

    // Log the form data for debugging
    console.log("Received form data entries:")
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File - ${value.name} (${value.size} bytes, ${value.type})`)
      } else {
        console.log(`${key}: ${value}`)
      }
    }

    // Validate that we have either images or prompt
    const images = formData.getAll("images") as File[]
    const prompt = formData.get("prompt") as string

    if ((!images || images.length === 0) && (!prompt || prompt.trim() === "")) {
      return NextResponse.json({ error: "Either images or prompt is required" }, { status: 400 })
    }

    // Validate image files
    if (images && images.length > 0) {
      for (const image of images) {
        if (!(image instanceof File)) {
          return NextResponse.json({ error: "Invalid image file" }, { status: 400 })
        }

        // Check file size (max 10MB per file)
        if (image.size > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: `Image ${image.name} is too large. Maximum size is 10MB.` },
            { status: 400 },
          )
        }

        // Check file type
        if (!image.type.startsWith("image/")) {
          return NextResponse.json({ error: `File ${image.name} is not a valid image.` }, { status: 400 })
        }
      }
    }

    // Create a new FormData for the API request
    const apiFormData = new FormData()

    // Add images if present
    if (images && images.length > 0) {
      for (const image of images) {
        apiFormData.append("images", image, image.name)
      }
    }

    // Add other form fields
    if (prompt && prompt.trim()) {
      apiFormData.append("prompt", prompt.trim())
    }

    // Add all other parameters
    const otherFields = [
      "condition_mode",
      "geometry_file_format",
      "material",
      "quality",
      "use_hyper",
      "tier",
      "TAPose",
      "mesh_mode",
      "mesh_simplify",
      "mesh_smooth",
    ]

    for (const field of otherFields) {
      const value = formData.get(field)
      if (value !== null) {
        apiFormData.append(field, value.toString())
      }
    }

    console.log("Sending request to Hyper3D API...")

    // Forward the request to the Hyper3D API
    const response = await fetch("https://hyperhuman.deemos.com/api/v2/rodin", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        // Don't set Content-Type header - let the browser set it with boundary
      },
      body: apiFormData,
    })

    console.log("API Response status:", response.status)
    console.log("API Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API Error Response:", errorText)

      let errorMessage = `API request failed: ${response.status}`
      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.error) {
          errorMessage = errorJson.error
        } else if (errorJson.message) {
          errorMessage = errorJson.message
        }
      } catch (e) {
        // If not JSON, use the text as is
        if (errorText) {
          errorMessage = errorText
        }
      }

      return NextResponse.json({ error: errorMessage, details: errorText }, { status: response.status })
    }

    const data = await response.json()
    console.log("API Success Response:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in Rodin API route:", error)

    // Provide more specific error messages
    let errorMessage = "Failed to process request"
    if (error instanceof Error) {
      errorMessage = error.message

      // Handle specific error types
      if (errorMessage.includes("fetch")) {
        errorMessage = "Failed to connect to the AI service. Please try again."
      } else if (errorMessage.includes("JSON")) {
        errorMessage = "Invalid response from AI service. Please try again."
      } else if (errorMessage.includes("FormData")) {
        errorMessage = "Invalid form data. Please check your inputs."
      }
    }

    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.stack : String(error) },
      { status: 500 },
    )
  }
}
