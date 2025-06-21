export async function submitRodinJob(formData: FormData) {
  try {
    const response = await fetch("/api/rodin", {
      method: "POST",
      body: formData,
    })

    // Check if response is ok first
    if (!response.ok) {
      const errorText = await response.text()
      console.error("API Error Response:", errorText)
      throw new Error(`API request failed: ${response.status} - ${errorText}`)
    }

    // Check content type before parsing JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await response.text()
      console.error("Non-JSON response:", responseText)
      throw new Error("Server returned non-JSON response")
    }

    return await response.json()
  } catch (error) {
    console.error("Error in submitRodinJob:", error)
    throw error
  }
}

export async function checkJobStatus(subscriptionKey: string) {
  try {
    const response = await fetch(`/api/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscription_key: subscriptionKey,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Status API Error Response:", errorText)
      throw new Error(`Status check failed: ${response.status} - ${errorText}`)
    }

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await response.text()
      console.error("Non-JSON status response:", responseText)
      throw new Error("Status API returned non-JSON response")
    }

    return await response.json()
  } catch (error) {
    console.error("Error in checkJobStatus:", error)
    throw error
  }
}

export async function downloadModel(taskUuid: string) {
  try {
    const response = await fetch(`/api/download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task_uuid: taskUuid,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Download API Error Response:", errorText)
      throw new Error(`Download failed: ${response.status} - ${errorText}`)
    }

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await response.text()
      console.error("Non-JSON download response:", responseText)
      throw new Error("Download API returned non-JSON response")
    }

    return await response.json()
  } catch (error) {
    console.error("Error in downloadModel:", error)
    throw error
  }
}
