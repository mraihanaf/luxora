"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import orpc from "@/lib/orpc/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type ProductType = "TOP" | "BOTTOM" | "HEADWEAR"

type SelectedMap = Partial<Record<ProductType, string>>

const productTypeOrder: ProductType[] = ["TOP", "BOTTOM", "HEADWEAR"]

const formatType = (type: ProductType) => {
  if (type === "TOP") return "Top"
  if (type === "BOTTOM") return "Bottom"
  return "Headwear"
}

export default function VideoTest() {
  const listQuery = useQuery(orpc.listProducts.queryOptions())
  const [selected, setSelected] = useState<SelectedMap>({})
  const [productsHash, setProductsHash] = useState<string | null>(null)

  const selectedIds = useMemo(() => {
    return productTypeOrder.map((t) => selected[t]).filter(Boolean) as string[]
  }, [selected])

  const productsByType = useMemo(() => {
    const items = listQuery.data ?? []
    const grouped: Record<ProductType, typeof items> = { TOP: [], BOTTOM: [], HEADWEAR: [] }
    for (const p of items) grouped[p.type].push(p)
    return grouped
  }, [listQuery.data])

  const generateMutation = useMutation(orpc.generateProductVideo.mutationOptions())

  const videoQuery = useQuery({
    ...orpc.getProductVideo.queryOptions({
      input: { productsHash: productsHash ?? "" },
    }),
    enabled: Boolean(productsHash),
    refetchInterval: (q) => (q.state.data?.videoUrl ? false : 3000),
  })

  const displayedVideo = videoQuery.data ?? (generateMutation.data ?? null)

  return (
    <div className="container mx-auto w-full max-w-5xl p-6 space-y-6">
      <Card className="p-6 space-y-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">Product Video Workflow Test</h1>
          <p className="text-sm text-muted-foreground">
            Select up to one product per category, then generate a lookbook video.
          </p>
        </div>

        {listQuery.isLoading && <p className="text-sm">Loading products…</p>}
        {listQuery.error && (
          <p className="text-sm text-destructive">{listQuery.error.message}</p>
        )}

        {!listQuery.isLoading && !listQuery.error && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {productTypeOrder.map((type) => {
                const items = productsByType[type]
                const current = selected[type]
                return (
                  <div key={type} className="space-y-2">
                    <p className="text-sm font-medium">{formatType(type)}</p>
                    <div className="space-y-2">
                      {items.length ? (
                        items.map((p) => {
                          const isSelected = current === p.id
                          return (
                            <button
                              key={p.id}
                              type="button"
                              className={cn(
                                "w-full rounded-md border p-3 text-left transition-colors",
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : "hover:bg-muted/40"
                              )}
                              onClick={() =>
                                setSelected((prev) => ({
                                  ...prev,
                                  [type]: prev[type] === p.id ? undefined : p.id,
                                }))
                              }
                            >
                              <p className="text-sm font-medium truncate">{p.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{p.id}</p>
                            </button>
                          )
                        })
                      ) : (
                        <p className="text-xs text-muted-foreground">No {formatType(type)} yet.</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                disabled={selectedIds.length < 1 || generateMutation.isPending}
                onClick={async () => {
                  const result = await generateMutation.mutateAsync({ productIds: selectedIds })
                  setProductsHash(result.productsHash)
                }}
              >
                Generate Video
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setSelected({})
                  setProductsHash(null)
                  generateMutation.reset()
                }}
                disabled={generateMutation.isPending}
              >
                Reset
              </Button>

              {generateMutation.isPending && (
                <p className="text-xs text-muted-foreground">Starting workflow…</p>
              )}
              {productsHash && (
                <p className="text-xs text-muted-foreground break-all">
                  productsHash: {productsHash}
                </p>
              )}
            </div>

            {generateMutation.error && (
              <p className="text-sm text-destructive">
                {generateMutation.error.message}
              </p>
            )}

            {productsHash && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Status</p>
                {videoQuery.isLoading && <p className="text-sm">Waiting for result…</p>}
                {videoQuery.error && (
                  <p className="text-sm text-destructive">{videoQuery.error.message}</p>
                )}

                {displayedVideo && (
                  <div className="space-y-3">
                    <div className="rounded-md border p-3">
                      <p className="text-xs text-muted-foreground break-all">
                        ProductVideo ID: {displayedVideo.id}
                      </p>
                      <p className="text-xs text-muted-foreground break-all">
                        PixVerse videoId: {displayedVideo.videoId ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground break-all">
                        videoUrl: {displayedVideo.videoUrl ?? "Generating…"}
                      </p>
                    </div>

                    {displayedVideo.videoUrl && (
                      <video
                        src={displayedVideo.videoUrl}
                        controls
                        className="w-full rounded-md border"
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}

