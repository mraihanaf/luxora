import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { s3 } from "@/lib/s3"

const getExtension = (filename: string) => {
  const parts = filename.split(".")
  const ext = parts.length > 1 ? parts.at(-1) : undefined
  const clean = ext?.trim().toLowerCase()
  return clean ? clean.replace(/[^a-z0-9]+/g, "") : "bin"
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const kind = request.nextUrl.searchParams.get("kind")
  const namespace = request.nextUrl.searchParams.get("namespace")

  if (kind !== "image" && kind !== "video") {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 })
  }

  if (!namespace || !namespace.trim()) {
    return NextResponse.json({ error: "Missing namespace" }, { status: 400 })
  }

  const form = await request.formData()
  const file = form.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 })
  }

  if (kind === "image" && !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Invalid image type" }, { status: 400 })
  }

  if (kind === "video" && file.type && !file.type.startsWith("video/")) {
    return NextResponse.json({ error: "Invalid video type" }, { status: 400 })
  }

  const ext = getExtension(file.name)
  const key = `products/${namespace}/${kind}-${Date.now()}.${ext}`
  const buffer = new Uint8Array(await file.arrayBuffer())

  await s3.uploadObject({
    key,
    body: buffer,
    contentType: file.type || "application/octet-stream",
  })

  const bucket = process.env.STORAGE_BUCKET
  if (!bucket) {
    return NextResponse.json({ error: "STORAGE_BUCKET is not set" }, { status: 500 })
  }

  const signedUrl = await s3.getSignedUrl({ key, expiresIn: 3600 })
  return NextResponse.json({ signedUrl, key })
}
