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
  imageUrl: z.string(),
  priceIdr: z.number().int(),
})

const productVideoSchema = z.object({
  id: z.string(),
  productsHash: z.string(),
  videoKey: z.string().nullable(),
  videoUrl: z.string().nullable(),
  videoId: z.string().nullable(),
  products: z.array(productListItemSchema),
})

const sha256 = (value: string) => {
  return createHash("sha256").update(value).digest("hex")
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

    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        type: true,
        name: true,
        imageKey: true,
        priceIdr: true,
      },
    })

    if (products.length !== ids.length) {
      throw new ORPCError("BAD_REQUEST", {
        message: "One or more products were not found",
      })
    }

    const productsHash = sha256(ids.join(":"))

    const existing = await prisma.productVideo.findUnique({
      where: { productsHash },
      select: {
        id: true,
        productsHash: true,
        videoKey: true,
        videoId: true,
        products: {
          select: {
            id: true,
            type: true,
            name: true,
            imageKey: true,
            priceIdr: true,
          },
        },
      },
    })

    if (existing) {
      return {
        id: existing.id,
        productsHash: existing.productsHash,
        videoKey: existing.videoKey ?? null,
        videoUrl: await signOptionalObjectKey(existing.videoKey),
        videoId: existing.videoId ?? null,
        products: await Promise.all(
          existing.products.map(async (p) => ({
            id: p.id,
            type: p.type,
            name: p.name,
            imageUrl: await signRequiredObjectKey(p.imageKey),
            priceIdr: p.priceIdr,
          }))
        ),
      }
    }

    let created
    try {
      created = await prisma.productVideo.create({
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
          products: {
            select: {
              id: true,
              type: true,
              name: true,
              imageKey: true,
              priceIdr: true,
            },
          },
        },
      })
    } catch {
      const raced = await prisma.productVideo.findUnique({
        where: { productsHash },
        select: {
          id: true,
          productsHash: true,
          videoKey: true,
          videoId: true,
          products: {
            select: {
              id: true,
              type: true,
              name: true,
              imageKey: true,
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

    return {
      id: created.id,
      productsHash: created.productsHash,
      videoKey: created.videoKey ?? null,
      videoUrl: await signOptionalObjectKey(created.videoKey),
      videoId: created.videoId ?? null,
      products: await Promise.all(
        created.products.map(async (p) => ({
          id: p.id,
          type: p.type,
          name: p.name,
          imageUrl: await signRequiredObjectKey(p.imageKey),
          priceIdr: p.priceIdr,
        }))
      ),
    }
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
    const productVideo = await prisma.productVideo.findUnique({
      where: { productsHash: input.productsHash },
      select: {
        id: true,
        productsHash: true,
        videoKey: true,
        videoId: true,
        products: {
          select: {
            id: true,
            type: true,
            name: true,
            imageKey: true,
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

    return {
      id: productVideo.id,
      productsHash: productVideo.productsHash,
      videoKey: productVideo.videoKey ?? null,
      videoUrl: await signOptionalObjectKey(productVideo.videoKey),
      videoId: productVideo.videoId ?? null,
      products: await Promise.all(
        productVideo.products.map(async (p) => ({
          id: p.id,
          type: p.type,
          name: p.name,
          imageUrl: await signRequiredObjectKey(p.imageKey),
          priceIdr: p.priceIdr,
        }))
      ),
    }
  })

export const productVideoRouter = {
  generateProductVideo,
  getProductVideo,
}
