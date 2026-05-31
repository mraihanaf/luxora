import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const getBucket = () => {
  const bucket = process.env.STORAGE_BUCKET
  if (!bucket) {
    throw new Error("STORAGE_BUCKET is not set")
  }
  return bucket
}

const getRegion = () => {
  const region = process.env.STORAGE_REGION
  if (!region) {
    throw new Error("STORAGE_REGION is not set")
  }
  return region
}

const getPublicBaseUrl = () => {
  const base = process.env.STORAGE_PUBLIC_BASE_URL
  if (base) return base.replace(/\/+$/, "")

  const endpoint = process.env.STORAGE_ENDPOINT
  if (endpoint) {
    const url = new URL(endpoint)
    if (url.pathname.endsWith("/storage/v1/s3")) {
      const bucket = getBucket()
      return `${url.origin}/storage/v1/object/public/${bucket}`
    }
  }

  const bucket = getBucket()
  const region = getRegion()
  if (region === "us-east-1") return `https://${bucket}.s3.amazonaws.com`
  return `https://${bucket}.s3.${region}.amazonaws.com`
}

const getClient = () => {
  const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID
  const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY
  const endpoint = process.env.STORAGE_ENDPOINT

  return new S3Client({
    region: getRegion(),
    endpoint: endpoint || undefined,
    forcePathStyle: Boolean(endpoint),
    credentials:
      accessKeyId && secretAccessKey
        ? {
            accessKeyId,
            secretAccessKey,
          }
        : undefined,
  })
}

export const s3 = {
  getPublicUrlForKey: (key: string) => {
    return `${getPublicBaseUrl()}/${key}`
  },

  getKeyFromPublicUrl: (publicUrl: string) => {
    try {
      const url = new URL(publicUrl)
      const base = getPublicBaseUrl()
      const baseUrl = new URL(base)
      if (url.origin !== baseUrl.origin) return null
      const prefix = baseUrl.pathname.replace(/\/+$/, "") + "/"
      if (!url.pathname.startsWith(prefix)) return null
      return decodeURIComponent(url.pathname.slice(prefix.length))
    } catch {
      return null
    }
  },

  uploadObject: async (params: { key: string; body: Uint8Array; contentType: string }) => {
    const client = getClient()
    const bucket = getBucket()

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
      })
    )

    return params.key
  },

  uploadPublicObject: async (params: { key: string; body: Uint8Array; contentType: string }) => {
    const key = await s3.uploadObject(params)
    return s3.getPublicUrlForKey(key)
  },

  deleteObject: async (params: { key: string }) => {
    const client = getClient()
    const bucket = getBucket()

    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: params.key,
      })
    )
  },

  downloadUrlToBuffer: async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw new Error(`Download failed ${res.status} ${res.statusText}${text ? `: ${text}` : ""}`)
    }
    const arrayBuffer = await res.arrayBuffer()
    return new Uint8Array(arrayBuffer)
  },

  getSignedUrl: async (params: {
    key: string
    expiresIn?: number
  }) => {
    const client = getClient()
    const bucket = getBucket()
    const expiresIn = params.expiresIn ?? 3600

    const command = new GetObjectCommand({ Bucket: bucket, Key: params.key })
    const url = await getSignedUrl(client, command, { expiresIn })
    return url
  },
}
