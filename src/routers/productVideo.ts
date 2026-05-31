import { ORPCError } from "@orpc/server"
import { z } from "zod"
import { createHash } from "crypto"
import prisma from "@/lib/prisma"
import { os, authedMiddleware } from "./base"
import { auth, tasks } from "@trigger.dev/sdk/v3"
import { s3 } from "@/lib/s3"

const productTypeSchema = z.enum(["TOP", "BOTTOM", "HEADWEAR"])

const signRequiredObjectKey = async (key: string) => {
  return s3.getSignedUrl({ key, expiresIn: 3600 })
}

const signOptionalObjectKey = async (key: string | null | undefined) => {
  if (!key) return null
  return signRequiredObjectKey(key)
}

const productListItemSchema = z.object({
  id: z.string(),
  type: productTypeSchema,
  name: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string(),
  priceIdr: z.number().int(),
  videoUrl: z.string().nullable(),
})

const productVideoSchema = z.object({
  id: z.string(),
  productsHash: z.string(),
  videoKey: z.string().nullable(),
  videoUrl: z.string().nullable(),
  videoId: z.string().nullable(),
  triggerRunId: z.string().nullable(),
  workflowStatus: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]),
  progressPercent: z.number().int().min(0).max(100),
  progressLabel: z.string().nullable(),
  errorMessage: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  products: z.array(productListItemSchema),
})

const productVideoRealtimeSessionSchema = z.object({
  runId: z.string(),
  accessToken: z.string(),
  expiresAt: z.string(),
})

type SelectedProduct = {
  id: string
  type: z.infer<typeof productTypeSchema>
  name: string
  description: string | null
  imageKey: string
  videoKey: string | null
  priceIdr: number
}

type SelectedProductVideo = {
  id: string
  productsHash: string
  videoKey: string | null
  videoId: string | null
  triggerRunId: string | null
  workflowStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
  progressPercent: number
  progressLabel: string | null
  errorMessage: string | null
  createdAt: Date
  updatedAt: Date
  products: SelectedProduct[]
}

type ProductVideoDbClient = {
  product: {
    findMany(args: unknown): Promise<SelectedProduct[]>
  }
  productVideo: {
    findUnique(args: unknown): Promise<SelectedProductVideo | null>
    create(args: unknown): Promise<SelectedProductVideo>
    findMany(args: unknown): Promise<SelectedProductVideo[]>
    update(args: unknown): Promise<SelectedProductVideo>
  }
}

const db = prisma as unknown as ProductVideoDbClient
const REALTIME_SESSION_EXPIRATION = "1h"

const productSelect = {
  id: true,
  type: true,
  name: true,
  description: true,
  imageKey: true,
  videoKey: true,
  priceIdr: true,
} as const

const productVideoSelect = {
  id: true,
  productsHash: true,
  videoKey: true,
  videoId: true,
  triggerRunId: true,
  workflowStatus: true,
  progressPercent: true,
  progressLabel: true,
  errorMessage: true,
  createdAt: true,
  updatedAt: true,
  products: {
    select: productSelect,
  },
} as const

const sha256 = (value: string) => {
  return createHash("sha256").update(value).digest("hex")
}

const toProductListItem = async (product: SelectedProduct) => {
  return {
    id: product.id,
    type: product.type,
    name: product.name,
    description: product.description,
    imageUrl: await signRequiredObjectKey(product.imageKey),
    priceIdr: product.priceIdr,
    videoUrl: await signOptionalObjectKey(product.videoKey),
  }
}

const toProductVideo = async (productVideo: SelectedProductVideo) => {
  return {
    id: productVideo.id,
    productsHash: productVideo.productsHash,
    videoKey: productVideo.videoKey ?? null,
    videoUrl: await signOptionalObjectKey(productVideo.videoKey),
    videoId: productVideo.videoId ?? null,
    triggerRunId: productVideo.triggerRunId ?? null,
    workflowStatus: productVideo.workflowStatus,
    progressPercent: productVideo.progressPercent,
    progressLabel: productVideo.progressLabel,
    errorMessage: productVideo.errorMessage,
    createdAt: productVideo.createdAt.toISOString(),
    updatedAt: productVideo.updatedAt.toISOString(),
    products: await Promise.all(productVideo.products.map(toProductListItem)),
  }
}

const generateProductVideo = os
  .use(authedMiddleware)
  .input(
    z.object({
      productIds: z.array(z.string()).min(1).max(3),
    })
  )
  .output(productVideoSchema)
  .handler(async ({ input }) => {
    const ids = Array.from(new Set(input.productIds)).sort()
    if (ids.length < 1 || ids.length > 3) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Select between 1 and 3 products",
      })
    }

    const products = await db.product.findMany({
      where: { id: { in: ids } },
      select: productSelect,
    })

    if (products.length !== ids.length) {
      throw new ORPCError("BAD_REQUEST", {
        message: "One or more products were not found",
      })
    }

    const productsHash = sha256(ids.join(":"))

    const existing = await db.productVideo.findUnique({
      where: { productsHash },
      select: productVideoSelect,
    })

    if (existing) {
      return toProductVideo(existing)
    }

    let created: SelectedProductVideo
    try {
      created = await db.productVideo.create({
        data: {
          productsHash,
          progressPercent: 5,
          progressLabel: "Queued render",
          products: {
            connect: ids.map((id: string) => ({ id })),
          },
        },
        select: productVideoSelect,
      })
    } catch {
      const raced = await db.productVideo.findUnique({
        where: { productsHash },
        select: productVideoSelect,
      })
      if (!raced) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create ProductVideo" })
      }
      created = raced
    }

    const handle = await tasks.trigger(
      "generate-product-video",
      { productVideoId: created.id },
      { idempotencyKey: productsHash }
    )

    const updated = await db.productVideo.update({
      where: { id: created.id },
      data: {
        triggerRunId: handle.id,
        workflowStatus: "PENDING",
        progressPercent: 5,
        progressLabel: "Queued render",
        errorMessage: null,
      },
      select: productVideoSelect,
    })

    return toProductVideo(updated)
  })

const getProductVideo = os
  .use(authedMiddleware)
  .input(
    z.object({
      productsHash: z.string(),
    })
  )
  .output(productVideoSchema)
  .handler(async ({ input }) => {
    const productVideo = await db.productVideo.findUnique({
      where: { productsHash: input.productsHash },
      select: productVideoSelect,
    })

    if (!productVideo) {
      throw new ORPCError("NOT_FOUND", {
        message: "ProductVideo not found",
      })
    }

    return toProductVideo(productVideo)
  })

const getProductVideoRealtimeSession = os
  .use(authedMiddleware)
  .input(
    z.object({
      productsHash: z.string(),
    })
  )
  .output(productVideoRealtimeSessionSchema.nullable())
  .handler(async ({ input }) => {
    const productVideo = await db.productVideo.findUnique({
      where: { productsHash: input.productsHash },
      select: {
        triggerRunId: true,
        workflowStatus: true,
        videoKey: true,
      },
    })

    if (
      !productVideo?.triggerRunId ||
      productVideo.videoKey ||
      productVideo.workflowStatus === "COMPLETED" ||
      productVideo.workflowStatus === "FAILED"
    ) {
      return null
    }

    const accessToken = await auth.createPublicToken({
      scopes: {
        read: {
          runs: [productVideo.triggerRunId],
        },
      },
      expirationTime: REALTIME_SESSION_EXPIRATION,
      realtime: {
        skipColumns: ["payload", "output"],
      },
    })

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    return {
      runId: productVideo.triggerRunId,
      accessToken,
      expiresAt,
    }
  })

const listProductVideos = os
  .output(z.array(productVideoSchema))
  .handler(async () => {
    const productVideos = await db.productVideo.findMany({
      where: {
        videoKey: {
          not: null,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: productVideoSelect,
    })

    return Promise.all(productVideos.map(toProductVideo))
  })

export const productVideoRouter = {
  generateProductVideo,
  getProductVideo,
  getProductVideoRealtimeSession,
  listProductVideos,
}
