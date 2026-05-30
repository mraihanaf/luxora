import { randomUUID } from "crypto"

const PIXVERSE_BASE_URL = "https://app-api.pixverse.ai/openapi/v2"

type PixVerseResponse<TResp> = {
  ErrCode: number
  ErrMsg: string
  Resp: TResp
}

const getApiKey = () => {
  const apiKey = process.env.PIXVERSE_API_KEY
  if (!apiKey) {
    throw new Error("PIXVERSE_API_KEY is not set")
  }
  return apiKey
}

const pixverseFetch = async (path: string, init: RequestInit = {}) => {
  const apiKey = getApiKey()
  const headers = new Headers(init.headers)
  headers.set("API-KEY", apiKey)
  headers.set("Ai-trace-id", randomUUID())

  const res = await fetch(`${PIXVERSE_BASE_URL}${path}`, {
    ...init,
    headers,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`PixVerse HTTP ${res.status} ${res.statusText}${text ? `: ${text}` : ""}`)
  }

  return (await res.json()) as PixVerseResponse<unknown>
}

export const pixverse = {
  uploadImageFromBuffer: async (params: { bytes: Uint8Array; filename: string; contentType: string }) => {
    const formData = new FormData()
    formData.append("image", new Blob([Buffer.from(params.bytes)], { type: params.contentType }), params.filename)

    const data = await pixverseFetch("/image/upload", {
      method: "POST",
      body: formData,
    })

    const parsed = data as PixVerseResponse<{ img_id: number; img_url: string }>
    if (parsed.ErrCode !== 0) {
      throw new Error(`PixVerse upload failed: ${parsed.ErrMsg}`)
    }

    return { imgId: parsed.Resp.img_id, imgUrl: parsed.Resp.img_url }
  },

  uploadImageFromUrl: async (imageUrl: string) => {
    const formData = new FormData()
    formData.append("image_url", imageUrl)

    const data = await pixverseFetch("/image/upload", {
      method: "POST",
      body: formData,
    })

    const parsed = data as PixVerseResponse<{ img_id: number; img_url: string }>
    if (parsed.ErrCode !== 0) {
      throw new Error(`PixVerse upload failed: ${parsed.ErrMsg}`)
    }

    return { imgId: parsed.Resp.img_id, imgUrl: parsed.Resp.img_url }
  },

  generateFusionVideo: async (params: {
    imageReferences: Array<{ type: "subject" | "background"; imgId: number; refName: string }>
    prompt: string
    model: string
    duration: number
    quality: string
    aspectRatio: string
    seed?: number
  }) => {
    const body = {
      image_references: params.imageReferences.map((ref) => ({
        type: ref.type,
        img_id: ref.imgId,
        ref_name: ref.refName,
      })),
      prompt: params.prompt,
      model: params.model,
      duration: params.duration,
      quality: params.quality,
      aspect_ratio: params.aspectRatio,
      seed: params.seed,
    }

    const data = await pixverseFetch("/video/fusion/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    const parsed = data as PixVerseResponse<{ video_id?: number }>
    if (parsed.ErrCode !== 0) {
      throw new Error(`PixVerse fusion generate failed: ${parsed.ErrMsg}`)
    }

    const videoId = parsed.Resp?.video_id
    if (typeof videoId !== "number") {
      throw new Error("PixVerse fusion generate returned no video_id")
    }

    return { videoId }
  },

  getVideoResult: async (videoId: number) => {
    const data = await pixverseFetch(`/video/result/${videoId}`, {
      method: "GET",
    })

    const parsed = data as PixVerseResponse<{ status: number; url?: string }>
    if (parsed.ErrCode !== 0) {
      throw new Error(`PixVerse video result failed: ${parsed.ErrMsg}`)
    }

    return parsed.Resp
  },
}
