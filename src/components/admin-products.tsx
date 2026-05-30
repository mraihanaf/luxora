"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import orpc from "@/lib/orpc/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type ProductType = "TOP" | "BOTTOM" | "HEADWEAR"

type FormState = {
  id?: string
  type: ProductType
  name: string
  description: string
  imageKey: string
  imageUrl: string
  videoKey: string
  videoUrl: string
  priceIdr: string
}

const defaultForm: FormState = {
  type: "TOP",
  name: "",
  description: "",
  imageKey: "",
  imageUrl: "",
  videoKey: "",
  videoUrl: "",
  priceIdr: "",
}

function formatIdr(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)
}

export default function AdminProducts() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FormState>(defaultForm)
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [isLoadingProduct, setIsLoadingProduct] = useState(false)
  const [editError, setEditError] = useState<string | undefined>(undefined)
  const [uploadError, setUploadError] = useState<string | undefined>(undefined)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [draftNamespace, setDraftNamespace] = useState(() => crypto.randomUUID())

  const listQuery = useQuery(orpc.listProducts.queryOptions())

  const isUploading = isUploadingImage || isUploadingVideo

  const uploadMedia = async (params: { kind: "image" | "video"; file: File }) => {
    const namespace = form.id ?? draftNamespace
    const qs = new URLSearchParams({ kind: params.kind, namespace })
    const body = new FormData()
    body.set("file", params.file)

    const res = await fetch(`/api/admin/upload?${qs.toString()}`, {
      method: "POST",
      body,
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw new Error(text || `Upload failed (${res.status})`)
    }

    const json = (await res.json()) as { signedUrl?: string; key?: string }
    if (!json.signedUrl || !json.key) {
      throw new Error("Upload failed")
    }

    return { signedUrl: json.signedUrl, key: json.key }
  }

  async function loadProduct(id: string) {
    setEditError(undefined)
    setUploadError(undefined)
    setIsLoadingProduct(true)
    setSelectedId(id)

    try {
      const product = await queryClient.fetchQuery(
        orpc.getProduct.queryOptions({ input: { id } })
      )

      setForm({
        id: product.id,
        type: product.type,
        name: product.name,
        description: product.description ?? "",
        imageKey: product.imageKey,
        imageUrl: product.imageUrl,
        videoKey: product.videoKey ?? "",
        videoUrl: product.videoUrl ?? "",
        priceIdr: String(product.priceIdr),
      })
      setDraftNamespace(product.id)
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Failed to load product")
    } finally {
      setIsLoadingProduct(false)
    }
  }

  const createMutation = useMutation(
    orpc.createProduct.mutationOptions({
      onSuccess: async () => {
        setSelectedId(undefined)
        setForm(defaultForm)
        setDraftNamespace(crypto.randomUUID())
        await queryClient.invalidateQueries({
          queryKey: orpc.listProducts.queryKey(),
        })
      },
    })
  )

  const updateMutation = useMutation(
    orpc.updateProduct.mutationOptions({
      onSuccess: async () => {
        setSelectedId(undefined)
        setForm(defaultForm)
        setDraftNamespace(crypto.randomUUID())
        await queryClient.invalidateQueries({
          queryKey: orpc.listProducts.queryKey(),
        })
      },
    })
  )

  const deleteMutation = useMutation(
    orpc.deleteProduct.mutationOptions({
      onSuccess: async () => {
        setSelectedId(undefined)
        setForm((prev) => (prev.id ? defaultForm : prev))
        setDraftNamespace(crypto.randomUUID())
        await queryClient.invalidateQueries({
          queryKey: orpc.listProducts.queryKey(),
        })
      },
    })
  )

  const isSaving = createMutation.isPending || updateMutation.isPending
  const isDeleting = deleteMutation.isPending

  const canSubmit = useMemo(() => {
    const price = Number(form.priceIdr)
    return (
      form.name.trim().length > 0 &&
      form.imageKey.trim().length > 0 &&
      Number.isInteger(price) &&
      price >= 0
    )
  }, [form.imageKey, form.name, form.priceIdr])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    if (isUploading) return

    const payload = {
      type: form.type,
      name: form.name.trim(),
      description: form.description.trim() ? form.description.trim() : null,
      imageKey: form.imageKey.trim(),
      videoKey: form.videoKey.trim() ? form.videoKey.trim() : null,
      priceIdr: Number(form.priceIdr),
    }

    if (form.id) {
      await updateMutation.mutateAsync({ id: form.id, ...payload })
      return
    }

    await createMutation.mutateAsync(payload)
  }

  async function onSelectImage(file: File) {
    setUploadError(undefined)
    setIsUploadingImage(true)
    try {
      const { signedUrl, key } = await uploadMedia({ kind: "image", file })
      setForm((prev) => ({ ...prev, imageKey: key, imageUrl: signedUrl }))
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Image upload failed")
    } finally {
      setIsUploadingImage(false)
    }
  }

  async function onSelectVideo(file: File) {
    setUploadError(undefined)
    setIsUploadingVideo(true)
    try {
      const { signedUrl, key } = await uploadMedia({ kind: "video", file })
      setForm((prev) => ({ ...prev, videoKey: key, videoUrl: signedUrl }))
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Video upload failed")
    } finally {
      setIsUploadingVideo(false)
    }
  }

  return (
    <div className="container mx-auto w-full max-w-5xl p-6 space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">Product Admin</h1>
          <p className="text-sm text-muted-foreground">
            Create, update, and delete products.
          </p>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              className={cn(
                "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              )}
              value={form.type}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, type: e.target.value as ProductType }))
              }
            >
              <option value="TOP">Top</option>
              <option value="BOTTOM">Bottom</option>
              <option value="HEADWEAR">Headwear</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Oversized T-Shirt"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className={cn(
                "min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              )}
              placeholder="Optional product details"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="imageFile">Product Image</Label>
            <Input
              id="imageFile"
              type="file"
              accept="image/*"
              disabled={isUploadingImage}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                void onSelectImage(file)
              }}
            />
            {form.imageUrl.trim() ? (
              <div className="grid gap-2">
                <img
                  src={form.imageUrl}
                  alt={form.name || "Product image"}
                  className="max-h-64 w-auto rounded-md border object-contain"
                />
                <p className="text-xs text-muted-foreground break-all">{form.imageUrl}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Upload an image to enable creating/updating the product.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="videoFile">Product Video (optional)</Label>
            <Input
              id="videoFile"
              type="file"
              accept="video/*"
              disabled={isUploadingVideo}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                void onSelectVideo(file)
              }}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={!form.videoKey.trim() || isUploadingVideo || isSaving || isDeleting}
                onClick={() => setForm((prev) => ({ ...prev, videoKey: "", videoUrl: "" }))}
              >
                Remove Video
              </Button>
              {isUploadingVideo && (
                <p className="text-xs text-muted-foreground self-center">Uploading…</p>
              )}
            </div>
            {form.videoUrl.trim() ? (
              <div className="grid gap-2">
                <video
                  src={form.videoUrl}
                  controls
                  className="max-h-64 w-full rounded-md border"
                />
                <p className="text-xs text-muted-foreground break-all">{form.videoUrl}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Upload a video if you want (optional).
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="priceIdr">Price (IDR)</Label>
            <Input
              id="priceIdr"
              value={form.priceIdr}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, priceIdr: e.target.value }))
              }
              inputMode="numeric"
              placeholder="e.g. 199000"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" disabled={!canSubmit || isSaving || isUploading}>
              {form.id ? "Update Product" : "Create Product"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSelectedId(undefined)
                setForm(defaultForm)
                setDraftNamespace(crypto.randomUUID())
              }}
              disabled={isSaving || isDeleting || isUploading}
            >
              Reset
            </Button>
          </div>

          {(createMutation.error || updateMutation.error) && (
            <p className="text-sm text-destructive">
              {(createMutation.error ?? updateMutation.error)?.message}
            </p>
          )}

          {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
          {editError && <p className="text-sm text-destructive">{editError}</p>}
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Products</h2>
          <Button
            type="button"
            variant="secondary"
            onClick={() => listQuery.refetch()}
            disabled={listQuery.isFetching}
          >
            Refresh
          </Button>
        </div>

        {listQuery.isLoading && <p className="mt-4 text-sm">Loading…</p>}

        {listQuery.error && (
          <p className="mt-4 text-sm text-destructive">{listQuery.error.message}</p>
        )}

        {!listQuery.isLoading && !listQuery.error && (
          <div className="mt-4 space-y-3">
            {listQuery.data?.length ? (
              listQuery.data.map((p) => {
                const isSelected = p.id === selectedId
                return (
                  <div
                    key={p.id}
                    className={cn(
                      "flex flex-col gap-2 rounded-md border p-4",
                      isSelected && "border-primary"
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{p.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {p.type} · {formatIdr(p.priceIdr)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => loadProduct(p.id)}
                          disabled={isLoadingProduct && isSelected}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => deleteMutation.mutate({ id: p.id })}
                          disabled={isDeleting}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground break-all">
                      {p.imageUrl}
                    </p>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground">No products yet.</p>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
