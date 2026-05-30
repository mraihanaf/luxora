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
  variant,
}: {
  item: IdeaItem
  variant: "wide" | "tall" | "small"
}) {
  return (
    <article className="glass-card overflow-hidden rounded-xl">
      <div className="relative bg-black">
        <div
          className={
            variant === "tall"
              ? "aspect-[4/5]"
              : variant === "wide"
                ? "aspect-[16/9]"
                : "aspect-[16/10]"
          }
        />
        <video
          src={item.videoUrl}
          controls
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="font-[family-name:var(--font-display)] text-[22px] leading-[1.1] text-[color:var(--text-primary)]">
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
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-24 md:px-16">
      <header className="mb-12">
        <h1 className="font-[family-name:var(--font-display)] text-[56px] leading-[1.05] tracking-[-0.02em] text-[color:var(--text-primary)]">
          Ideas — Video Gallery
        </h1>
        <p className="mt-4 max-w-3xl text-[16px] leading-[1.8] text-[color:var(--text-secondary)]">
          Completed Trigger-generated product videos from the Luxora workflow, presented as a
          browsable gallery of rendered outfit concepts.
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
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={index === 0 ? "lg:col-span-8" : index === 1 ? "lg:col-span-4" : "lg:col-span-4"}
            >
              <IdeaCard
                item={item}
                variant={index === 0 ? "wide" : index === 1 ? "tall" : "small"}
              />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
