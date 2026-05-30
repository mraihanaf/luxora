import { ORPCError } from "@orpc/server"
import { z } from "zod"
import { createHash } from "crypto"
import prisma from "@/lib/prisma"
import { os, authedMiddleware } from "./base"
import { tasks } from "@trigger.dev/sdk/v3"
import { createAdminClient } from "@/lib/supabase/admin"

const productTypeSchema = z.enum(["TOP", "BOTTOM", "HEADWEAR"])
const SIGNED_URL_TTL_SECONDS = 60 * 60

const getBucket = () => {
  const bucket = process.env.STORAGE_BUCKET
  if (!bucket) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "STORAGE_BUCKET is not set" })
  }
  return bucket
}

const signRequiredObjectKey = async (key: string) => {
  const admin = createAdminClient()
  const bucket = getBucket()
  const { data, error } = await admin.storage.from(bucket).createSignedUrl(key, SIGNED_URL_TTL_SECONDS)
  if (error || !data?.signedUrl) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: error?.message ?? "Failed to sign url" })
  }
  return data.signedUrl
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
  workflowStatus: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]),
  errorMessage: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  products: z.array(productListItemSchema),
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
  workflowStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
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
  }
}

const db = prisma as unknown as ProductVideoDbClient

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
    workflowStatus: productVideo.workflowStatus,
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
      select: {
        id: true,
        type: true,
        name: true,
        description: true,
        imageKey: true,
        videoKey: true,
        priceIdr: true,
      },
    })

    if (products.length !== ids.length) {
      throw new ORPCError("BAD_REQUEST", {
        message: "One or more products were not found",
      })
    }

    const productsHash = sha256(ids.join(":"))

    const existing = await db.productVideo.findUnique({
      where: { productsHash },
      select: {
        id: true,
        productsHash: true,
        videoKey: true,
        videoId: true,
        workflowStatus: true,
        errorMessage: true,
        createdAt: true,
        updatedAt: true,
        products: {
          select: {
            id: true,
            type: true,
            name: true,
            description: true,
            imageKey: true,
            videoKey: true,
            priceIdr: true,
          },
        },
      },
    })

    if (existing) {
      return toProductVideo(existing)
    }

    let created
    try {
      created = await db.productVideo.create({
        data: {
          productsHash,
          products: {
            connect: ids.map((id) => ({ id })),
          },
        },
        select: {
          id: true,
          productsHash: true,
          videoKey: true,
          videoId: true,
          workflowStatus: true,
          errorMessage: true,
          createdAt: true,
          updatedAt: true,
          products: {
            select: {
              id: true,
              type: true,
              name: true,
              description: true,
              imageKey: true,
              videoKey: true,
              priceIdr: true,
            },
          },
        },
      })
    } catch {
      const raced = await db.productVideo.findUnique({
        where: { productsHash },
        select: {
          id: true,
          productsHash: true,
          videoKey: true,
          videoId: true,
          workflowStatus: true,
          errorMessage: true,
          createdAt: true,
          updatedAt: true,
          products: {
            select: {
              id: true,
              type: true,
              name: true,
              description: true,
              imageKey: true,
              videoKey: true,
              priceIdr: true,
            },
          },
        },
      })
      if (!raced) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create ProductVideo" })
      }
      created = raced
    }

    await tasks.trigger(
      "generate-product-video",
      { productVideoId: created.id },
      { idempotencyKey: productsHash }
    )

    return toProductVideo(created)
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
      select: {
        id: true,
        productsHash: true,
        videoKey: true,
        videoId: true,
        workflowStatus: true,
        errorMessage: true,
        createdAt: true,
        updatedAt: true,
        products: {
          select: {
            id: true,
            type: true,
            name: true,
            description: true,
            imageKey: true,
            videoKey: true,
            priceIdr: true,
          },
        },
      },
    })

    if (!productVideo) {
      throw new ORPCError("NOT_FOUND", {
        message: "ProductVideo not found",
      })
    }

    return toProductVideo(productVideo)
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
      select: {
        id: true,
        productsHash: true,
        videoKey: true,
        videoId: true,
        workflowStatus: true,
        errorMessage: true,
        createdAt: true,
        updatedAt: true,
        products: {
          select: {
            id: true,
            type: true,
            name: true,
            description: true,
            imageKey: true,
            videoKey: true,
            priceIdr: true,
          },
        },
      },
    })

    return Promise.all(productVideos.map(toProductVideo))
  })

export const productVideoRouter = {
  generateProductVideo,
  getProductVideo,
  listProductVideos,
}
