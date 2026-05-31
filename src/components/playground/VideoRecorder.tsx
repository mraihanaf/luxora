"use client";

import { productTypeLabels } from "@/lib/storefront";
import type { StorefrontProduct, StorefrontProductVideo } from "@/lib/types";

export function VideoRecorder({
  picks,
  video,
  isStarting,
  isPolling,
  error,
}: {
  picks: StorefrontProduct[]
  video: StorefrontProductVideo | null
  isStarting: boolean
  isPolling: boolean
  error: string | null
}) {
  const hasSelection = picks.length > 0
  const status = error
    ? "Error"
    : video?.videoUrl
      ? "Ready"
      : isStarting
        ? "Starting"
        : isPolling
          ? "Rendering"
          : hasSelection
            ? "Awaiting launch"
            : "Select products"

  return (
    <div className="glass-card p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
            Trigger Workflow
          </div>
          <div className="mt-2 font-[family-name:var(--font-display)] text-[34px] font-light text-[color:var(--text-primary)]">
            Product video
          </div>
          <div className="mt-4 max-w-xl text-[14px] leading-[1.8] text-[color:var(--text-secondary)]">
            The workflow composes your selected products into a lookbook video and polls for the
            finished render.
          </div>
        </div>

        <div className="rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] px-4 py-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          {status}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] p-4">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
          <span>Selected pieces</span>
          <span className="text-[color:var(--text-secondary)]">{picks.length}/3</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {picks.length ? (
            picks.map((product) => (
              <div
                key={product.id}
                className="rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-lowest)] px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]"
              >
                {productTypeLabels[product.type]} · {product.name}
              </div>
            ))
          ) : (
            <div className="text-[13px] text-[color:var(--text-secondary)]">
              Choose up to one product from each slot to start the workflow.
            </div>
          )}
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-[13px] text-[color:var(--text-primary)]">
          {error}
        </div>
      ) : null}

      {video ? (
        <div className="mt-6 rounded-2xl border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] p-4">
          <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
            <span>Hash: {video.productsHash}</span>
            <span>Video ID: {video.videoId ?? "Pending"}</span>
          </div>
          {video.videoUrl ? (
            <div className="mx-auto mt-4 w-full max-w-[260px] sm:max-w-[300px] md:max-w-[340px]">
              <div className="overflow-hidden rounded-2xl border border-[color:var(--glass-border)] bg-black shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
                <video
                  src={video.videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="aspect-[9/16] w-full object-cover"
                />
              </div>
              <div className="mt-3 text-center font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                Vertical preview · autoplay enabled
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-[color:var(--glass-border)] p-8 text-center text-[14px] text-[color:var(--text-secondary)]">
              Render in progress. This panel refreshes automatically when the workflow completes.
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
