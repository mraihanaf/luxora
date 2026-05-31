"use client";

import { useQuery } from "@tanstack/react-query";
import orpc from "@/lib/orpc/client";
import { formatIdr, productTypeLabels } from "@/lib/storefront";
import type { StorefrontProductType } from "@/lib/types";

type GalleryVideoProduct = {
  id: string
  type: StorefrontProductType
  name: string
  imageUrl: string
  priceIdr: number
}

type GalleryVideo = {
  id: string
  productsHash: string
  videoKey: string | null
  videoUrl: string | null
  videoId: string | null
  createdAt: string
  updatedAt: string
  products: GalleryVideoProduct[]
}

type IdeaItem = Omit<GalleryVideo, "videoUrl"> & {
  videoUrl: string
  title: string
  description: string
}

function IdeaCard({
  item,
}: {
  item: IdeaItem
}) {
  return (
    <article className="glass-card mb-6 inline-block w-full overflow-hidden rounded-[28px] border border-white/10 bg-[color:var(--surface-container-lowest)] align-top">
      <div className="relative aspect-[9/16] overflow-hidden bg-black">
        <video
          src={item.videoUrl}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="rounded-full border border-white/20 bg-black/30 px-3 py-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-white/90 backdrop-blur-sm">
              {item.products.length} Piece{item.products.length === 1 ? "" : "s"}
            </div>
            <div className="rounded-full border border-white/20 bg-black/30 px-3 py-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-white/90 backdrop-blur-sm">
              9:16
            </div>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="font-[family-name:var(--font-display)] text-[24px] leading-[1.05] text-[color:var(--text-primary)]">
              {item.title}
            </div>
            <div className="mt-2 text-[14px] leading-[1.7] text-[color:var(--text-secondary)]">
              {item.description}
            </div>
          </div>
          <div className="rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-lowest)] px-3 py-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-primary)]">
            Ready
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {item.products.map((product) => (
            <div
              key={product.id}
              className="rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-low)] px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]"
            >
              {productTypeLabels[product.type]} · {product.name} · {formatIdr(product.priceIdr)}
            </div>
          ))}
        </div>

        <div className="mt-5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
          Updated {new Date(item.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </article>
  );
}

function getIdeaItems(items: GalleryVideo[]): IdeaItem[] {
  return items
    .filter((item): item is GalleryVideo & { videoUrl: string } => Boolean(item.videoUrl))
    .map((item) => ({
      ...item,
      title: item.products.map((product) => product.name).join(" + "),
      description: `Completed lookbook video for ${item.products.length} selected product${item.products.length === 1 ? "" : "s"}.`,
    }));
}

export default function IdeasPage() {
  const ideasQuery = useQuery(orpc.listProductVideos.queryOptions());
  const items = ideasQuery.data ? getIdeaItems(ideasQuery.data) : [];

  return (
    <div className="mx-auto w-full max-w-[1520px] px-4 pb-24 md:px-10 xl:px-14">
      <header className="mb-12">
        <h1 className="font-[family-name:var(--font-display)] text-[56px] leading-[1.05] tracking-[-0.02em] text-[color:var(--text-primary)]">
          Ideas — Motion Board
        </h1>
        <p className="mt-4 max-w-3xl text-[16px] leading-[1.8] text-[color:var(--text-secondary)]">
          Completed Luxora lookbook videos in a Pinterest-style board, optimized for vertical
          browsing and autoplay preview.
        </p>
      </header>

      {ideasQuery.isLoading ? (
        <div className="glass-card rounded-xl px-6 py-14 text-center text-[14px] text-[color:var(--text-secondary)]">
          Loading completed videos...
        </div>
      ) : ideasQuery.error ? (
        <div className="glass-card rounded-xl px-6 py-14 text-center">
          <div className="font-[family-name:var(--font-display)] text-3xl text-[color:var(--text-primary)]">
            Gallery unavailable.
          </div>
          <div className="mt-3 text-[14px] text-[color:var(--text-secondary)]">
            {ideasQuery.error.message}
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card rounded-xl px-6 py-14 text-center">
          <div className="font-[family-name:var(--font-display)] text-3xl text-[color:var(--text-primary)]">
            No completed videos yet.
          </div>
          <div className="mt-3 text-[14px] text-[color:var(--text-secondary)]">
            Generate a product video from the playground to populate this gallery.
          </div>
        </div>
      ) : (
        <section className="columns-1 gap-6 sm:columns-2 xl:columns-3 2xl:columns-4">
          {items.map((item) => (
            <IdeaCard
              key={item.id}
              item={item}
            />
          ))}
        </section>
      )}
    </div>
  );
}
