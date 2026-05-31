import { metadata, schemaTask, wait } from "@trigger.dev/sdk/v3"
import { z } from "zod"
import sharp from "sharp"
import prisma from "@/lib/prisma"
import { pixverse } from "@/lib/pixverse"
import { s3 } from "@/lib/s3"

const scenePrompt =
  "Create a fashion lookbook video in a minimalist studio with a solid light green background. Begin with a medium shot of the model raising her hand gracefully, cut to close-up macro shots highlighting fabric texture, and finish with a full-body wide shot of her standing casually with her hands in her pockets. Use bright professional studio lighting with soft shadows."
const AVATAR_IMAGE_URL =
  "https://media.pixverse.ai/pixverse%2Ft2i%2Fori%2Fc723da5a-0f66-4dc3-a5d0-0134daf57769.png"

const downloadImageToBuffer = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Failed to download image ${url}: ${res.status} ${res.statusText}${text ? `: ${text}` : ""}`)
  }
  const arrayBuffer = await res.arrayBuffer()
  return new Uint8Array(arrayBuffer)
}

const buildOutfitReferenceImage = async (imageUrls: string[]) => {
  const targetWidth = 768
  const spacing = 24

  const resized = []
  for (const url of imageUrls) {
    const bytes = await downloadImageToBuffer(url)
    const { data, info } = await sharp(bytes)
      .resize({ width: targetWidth, fit: "inside", withoutEnlargement: true })
      .png()
      .toBuffer({ resolveWithObject: true })
    resized.push({ data, width: info.width, height: info.height })
  }

  if (resized.length === 0) {
    throw new Error("No outfit images provided")
  }

  const totalHeight =
    resized.reduce((sum, img) => sum + img.height, 0) + spacing * Math.max(0, resized.length - 1)

  let top = 0
  const composites = resized.map((img) => {
    const entry = { input: img.data, top, left: Math.floor((targetWidth - img.width) / 2) }
    top += img.height + spacing
    return entry
  })

  const buffer = await sharp({
    create: {
      width: targetWidth,
      height: totalHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite(composites)
    .png()
    .toBuffer()

  return new Uint8Array(buffer)
}

const signRequiredObjectKey = async (key: string) => {
  return s3.getSignedUrl({ key, expiresIn: 3600 })
}

type WorkflowStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"

type ProductForPrompt = {
  type: string
  name: string
  description: string | null
}

const cleanPromptText = (value: string | null | undefined) => {
  if (!value) return null
  const cleaned = value.replace(/\s+/g, " ").trim()
  if (!cleaned) return null
  return cleaned.replace(/[.]+$/, "")
}

const describeGarment = (product: ProductForPrompt) => {
  const name = cleanPromptText(product.name) ?? product.type.toLowerCase()
  const description = cleanPromptText(product.description)
  if (!description) {
    return name
  }

  return `${name}, ${description}`
}

const buildGarmentInstructions = (products: ProductForPrompt[]) => {
  const top = products.find((product) => product.type === "TOP")
  const bottom = products.find((product) => product.type === "BOTTOM")
  const headwear = products.find((product) => product.type === "HEADWEAR")
  const instructions: string[] = [
    "Dress @model in the exact garments shown in @outfit and keep the outfit faithful to the selected pieces.",
  ]

  if (top) {
    instructions.push(
      `The selected top is ${describeGarment(top)}. Replace the avatar's original upper-body garment with this exact top. Do not keep any conflicting cardigan, jacket, or default upper-body layer from the avatar. Preserve the selected top's garment category, neckline, sleeve shape, silhouette, and layering intent.`
    )
  }

  if (bottom) {
    instructions.push(
      `The selected bottom is ${describeGarment(bottom)}. Match the lower-body silhouette and styling of this bottom faithfully.`
    )
  }

  if (headwear) {
    instructions.push(
      `The selected headwear is ${describeGarment(headwear)}. Include it as part of the final look when visible.`
    )
  }

  instructions.push(
    "Keep the styling realistic, editorial, and fashion-focused while ensuring the selected garments remain the dominant outfit identity."
  )

  return instructions.join(" ")
}

const buildFusionPrompt = (products: ProductForPrompt[]) => {
  const garmentPrompt = buildGarmentInstructions(products)
  return `${garmentPrompt} ${scenePrompt}`
}

const updateWorkflowProgress = async (params: {
  productVideoId: string
  workflowStatus: WorkflowStatus
  progressPercent: number
  progressLabel: string
  errorMessage?: string | null
}) => {
  metadata.replace({
    workflowStatus: params.workflowStatus,
    progressPercent: params.progressPercent,
    progressLabel: params.progressLabel,
  })
  await metadata.flush()

  await prisma.productVideo.update({
    where: { id: params.productVideoId },
    data: {
      workflowStatus: params.workflowStatus,
      progressPercent: params.progressPercent,
      progressLabel: params.progressLabel,
      errorMessage: params.errorMessage ?? null,
    },
  })
}

export const generateProductVideo = schemaTask({
  id: "generate-product-video",
  schema: z.object({
    productVideoId: z.string(),
  }),
  queue: {
    concurrencyLimit: 2,
  },
  run: async ({ productVideoId }) => {
    const productVideo = await prisma.productVideo.findUnique({
      where: { id: productVideoId },
      include: { products: true },
    })

    if (!productVideo) {
      throw new Error("ProductVideo not found")
    }

    let lastProgressLabel = productVideo.progressLabel ?? "Queued render"

    try {
      if (productVideo.videoKey) {
        await updateWorkflowProgress({
          productVideoId: productVideo.id,
          workflowStatus: "COMPLETED",
          progressPercent: 100,
          progressLabel: "Render complete",
        })
        return { videoUrl: await signRequiredObjectKey(productVideo.videoKey) }
      }

      await updateWorkflowProgress({
        productVideoId: productVideo.id,
        workflowStatus: "PROCESSING",
        progressPercent: 15,
        progressLabel: "Preparing model assets",
      })
      lastProgressLabel = "Preparing model assets"

      const avatarBytes = await downloadImageToBuffer(AVATAR_IMAGE_URL)

      await updateWorkflowProgress({
        productVideoId: productVideo.id,
        workflowStatus: "PROCESSING",
        progressPercent: 30,
        progressLabel: "Composing outfit reference",
      })
      lastProgressLabel = "Composing outfit reference"

      const sortedProducts = [...productVideo.products].sort((a, b) => a.type.localeCompare(b.type))
      const outfitUrls = await Promise.all(sortedProducts.map((p) => signRequiredObjectKey(p.imageKey)))
      const outfitImageBytes = await buildOutfitReferenceImage(outfitUrls)

      await updateWorkflowProgress({
        productVideoId: productVideo.id,
        workflowStatus: "PROCESSING",
        progressPercent: 45,
        progressLabel: "Uploading references",
      })
      lastProgressLabel = "Uploading references"

      const avatarUpload = await pixverse.uploadImageFromBuffer({
        bytes: avatarBytes,
        filename: "avatar-model.png",
        contentType: "image/png",
      })
      const outfitUpload = await pixverse.uploadImageFromBuffer({
        bytes: outfitImageBytes,
        filename: "outfit.png",
        contentType: "image/png",
      })

      await updateWorkflowProgress({
        productVideoId: productVideo.id,
        workflowStatus: "PROCESSING",
        progressPercent: 60,
        progressLabel: "Starting video render",
      })
      lastProgressLabel = "Starting video render"

      const prompt = buildFusionPrompt(sortedProducts)
      console.log("[generate-product-video] prompt:", {
        products: sortedProducts.map((product) => ({
          type: product.type,
          name: product.name,
          description: product.description,
        })),
        prompt,
      })

      const fusion = await pixverse.generateFusionVideo({
        imageReferences: [
          { type: "subject", imgId: avatarUpload.imgId, refName: "model" },
          { type: "subject", imgId: outfitUpload.imgId, refName: "outfit" },
        ],
        prompt,
        model: "v6",
        duration: 10,
        quality: "1080p",
        aspectRatio: "9:16",
      })

      await updateWorkflowProgress({
        productVideoId: productVideo.id,
        workflowStatus: "PROCESSING",
        progressPercent: 75,
        progressLabel: "Waiting for PixVerse result",
      })
      lastProgressLabel = "Waiting for PixVerse result"

      let pixverseUrl: string | undefined
      for (let attempt = 0; attempt < 300; attempt++) {
        const result = await pixverse.getVideoResult(fusion.videoId)
        if (result.status === 1 && result.url) {
          pixverseUrl = result.url
          break
        }
        if (result.status === 7) {
          throw new Error("PixVerse moderation failed")
        }
        if (result.status === 8) {
          throw new Error("PixVerse generation failed")
        }
        await wait.for({ seconds: 6 })
      }

      if (!pixverseUrl) {
        throw new Error("Timed out waiting for PixVerse video")
      }

      await updateWorkflowProgress({
        productVideoId: productVideo.id,
        workflowStatus: "PROCESSING",
        progressPercent: 90,
        progressLabel: "Uploading final video",
      })
      lastProgressLabel = "Uploading final video"

      const videoBytes = await s3.downloadUrlToBuffer(pixverseUrl)
      const key = `product-videos/${productVideo.productsHash}.mp4`
      const videoKey = await s3.uploadObject({
        key,
        body: videoBytes,
        contentType: "video/mp4",
      })

      const updated = await prisma.productVideo.update({
        where: { id: productVideo.id },
        data: {
          videoKey,
          videoId: String(fusion.videoId),
          workflowStatus: "COMPLETED",
          progressPercent: 100,
          progressLabel: "Render complete",
          errorMessage: null,
        },
        select: {
          videoKey: true,
        },
      })

      metadata.replace({
        workflowStatus: "COMPLETED",
        progressPercent: 100,
        progressLabel: "Render complete",
      })
      await metadata.flush()

      return { videoUrl: await signRequiredObjectKey(updated.videoKey!) }
    } catch (error) {
      await updateWorkflowProgress({
        productVideoId: productVideo.id,
        workflowStatus: "FAILED",
        progressPercent: Math.min(99, Math.max(productVideo.progressPercent, 15)),
        progressLabel: lastProgressLabel || "Render failed",
        errorMessage: error instanceof Error ? error.message : "Render failed",
      })
      throw error
    }
  },
})
