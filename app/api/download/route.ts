import { NextResponse } from "next/server"

const API_KEY = "vibecoding" // Public API key

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { task_uuid } = body

    if (!task_uuid) {
      return NextResponse.json({ error: "Missing task_uuid" }, { status: 400 })
    }

    console.log("Downloading model for task_uuid:", task_uuid)

    const response = await fetch("https://hyperhuman.deemos.com/api/v2/download", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ task_uuid }),
    })

    console.log("Download API Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Download API Error Response:", errorText)
      return NextResponse.json(
        { error: `Download failed: ${response.status}`, details: errorText },
        { status: response.status },
      )
    }

    // Check if response is JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await response.text()
      console.error("Non-JSON download response:", responseText)
      return NextResponse.json(
        { error: "Download API returned non-JSON response", details: responseText },
        { status: 502 },
      )
    }

    const data = await response.json()
    console.log("Download API Success Response:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in Download API route:", error)
    return NextResponse.json(
      { error: "Failed to download model", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
