import { ORPCError } from "@orpc/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { s3 } from "@/lib/s3"
import { createAdminClient } from "@/lib/supabase/admin"
import { os, adminMiddleware } from "./base"

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

const productDetailSchema = productListItemSchema.extend({
  description: z.string().nullable(),
  imageKey: z.string(),
  videoKey: z.string().nullable(),
  videoUrl: z.string().nullable(),
})

const listProducts = os
  .output(z.array(productListItemSchema))
  .handler(async () => {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        type: true,
        name: true,
        imageKey: true,
        priceIdr: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const signed = await Promise.all(
      products.map(async (p) => ({
        id: p.id,
        type: p.type,
        name: p.name,
        imageUrl: await signRequiredObjectKey(p.imageKey),
        priceIdr: p.priceIdr,
      }))
    )

    return signed
  })

const getProduct = os
  .input(z.object({ id: z.string() }))
  .output(productDetailSchema)
  .handler(async ({ input }) => {
    const product = await prisma.product.findUnique({
      where: { id: input.id },
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

    if (!product) {
      throw new ORPCError("NOT_FOUND", {
        message: "Product not found",
      })
    }

    return {
      id: product.id,
      type: product.type,
      name: product.name,
      description: product.description ?? null,
      imageKey: product.imageKey,
      videoKey: product.videoKey ?? null,
      imageUrl: await signRequiredObjectKey(product.imageKey),
      videoUrl: await signOptionalObjectKey(product.videoKey),
      priceIdr: product.priceIdr,
    }
  })

const createProduct = os
  .use(adminMiddleware)
  .input(
    z.object({
      type: productTypeSchema,
      name: z.string().min(1),
      description: z.string().nullable().optional(),
      imageKey: z.string().min(1),
      videoKey: z.string().nullable().optional(),
      priceIdr: z.number().int().nonnegative(),
    })
  )
  .output(productDetailSchema)
  .handler(async ({ input }) => {
    const product = await prisma.product.create({
      data: {
        type: input.type,
        name: input.name,
        description: input.description ?? null,
        imageKey: input.imageKey,
        videoKey: input.videoKey ?? null,
        priceIdr: input.priceIdr,
      },
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

    return {
      id: product.id,
      type: product.type,
      name: product.name,
      description: product.description ?? null,
      imageKey: product.imageKey,
      videoKey: product.videoKey ?? null,
      imageUrl: await signRequiredObjectKey(product.imageKey),
      videoUrl: await signOptionalObjectKey(product.videoKey),
      priceIdr: product.priceIdr,
    }
  })

const updateProduct = os
  .use(adminMiddleware)
  .input(
    z.object({
      id: z.string(),
      type: productTypeSchema.optional(),
      name: z.string().min(1).optional(),
      description: z.string().nullable().optional(),
      imageKey: z.string().min(1).optional(),
      videoKey: z.string().nullable().optional(),
      priceIdr: z.number().int().nonnegative().optional(),
    })
  )
  .output(productDetailSchema)
  .handler(async ({ input }) => {
    const existing = await prisma.product.findUnique({
      where: { id: input.id },
      select: { imageKey: true, videoKey: true },
    })

    if (!existing) {
      throw new ORPCError("NOT_FOUND", {
        message: "Product not found",
      })
    }

    const product = await prisma.product.update({
      where: { id: input.id },
      data: {
        type: input.type,
        name: input.name,
        description: input.description,
        imageKey: input.imageKey,
        videoKey: input.videoKey,
        priceIdr: input.priceIdr,
      },
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

    const deletions: Promise<void>[] = []

    if (input.imageKey && input.imageKey !== existing.imageKey) {
      deletions.push(s3.deleteObject({ key: existing.imageKey }).catch(() => undefined))
    }

    if (input.videoKey !== undefined && input.videoKey !== existing.videoKey && existing.videoKey) {
      deletions.push(s3.deleteObject({ key: existing.videoKey }).catch(() => undefined))
    }

    await Promise.all(deletions)

    return {
      id: product.id,
      type: product.type,
      name: product.name,
      description: product.description ?? null,
      imageKey: product.imageKey,
      videoKey: product.videoKey ?? null,
      imageUrl: await signRequiredObjectKey(product.imageKey),
      videoUrl: await signOptionalObjectKey(product.videoKey),
      priceIdr: product.priceIdr,
    }
  })

const deleteProduct = os
  .use(adminMiddleware)
  .input(z.object({ id: z.string() }))
  .output(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    const existing = await prisma.product.findUnique({
      where: { id: input.id },
      select: { imageKey: true, videoKey: true },
    })

    if (!existing) {
      throw new ORPCError("NOT_FOUND", {
        message: "Product not found",
      })
    }

    const product = await prisma.product.delete({
      where: { id: input.id },
      select: { id: true },
    })

    await Promise.all([
      s3.deleteObject({ key: existing.imageKey }).catch(() => undefined),
      existing.videoKey ? s3.deleteObject({ key: existing.videoKey }).catch(() => undefined) : undefined,
    ])

    return product
  })

export const productRouter = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
}
