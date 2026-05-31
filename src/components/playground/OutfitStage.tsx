"use client";

import Image from "next/image";
import type { StorefrontProduct } from "@/lib/types";

export function OutfitStage({ picks }: { picks: StorefrontProduct[] }) {
  const prompt = picks.length
    ? `high-fashion editorial studio photograph of a model wearing ${picks
        .map((p) => p.name)
        .join(", ")}, minimalist luxury, soft cinematic lighting, subtle metallic gold accents, neutral background, ultra realistic`
    : "high-fashion editorial studio photograph of a model silhouette, minimalist luxury, soft cinematic lighting, subtle metallic gold accents, neutral background, ultra realistic";



  return (
    <div className="glass-card relative aspect-[4/3] overflow-hidden rounded-xl">
      <div className="absolute inset-0 bg-[color:var(--surface-container-lowest)]" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.03)_0%,transparent_55%)]" />
      </div>

      <div className="absolute left-6 top-6 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-[color:var(--primary-container)] animate-pulse" />
        <div className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-[color:var(--primary-container)]">
          Outfit Preview
        </div>
      </div>

      <button
        type="button"
        aria-label="Play preview"
        className="absolute bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--glass-surface)] text-[color:var(--text-primary)] hover:bg-[color:var(--surface-container-low)]"
      >
        ▶
      </button>
    </div>
  );
}
