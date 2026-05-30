"use client";

import Image from "next/image";
import { productById } from "@/lib/products";
import type { Outfit, Product } from "@/lib/types";

export function OutfitStage({ outfit }: { outfit: Outfit }) {
  const picks = Object.entries(outfit)
    .map(([slot, id]) => {
      const p = id ? productById.get(id) : null;
      return p ? { slot, product: p } : null;
    })
    .filter((x): x is { slot: string; product: Product } => Boolean(x));

  return (
    <div className="glass-card relative aspect-[4/3] overflow-hidden rounded-xl">
      <div className="absolute inset-0 bg-[color:var(--surface-container-low)]" />
      <div className="absolute inset-0 opacity-50">
        <div className="absolute inset-0 bg-[radial-gradient(900px_600px_at_55%_15%,rgba(48,105,72,0.10),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(860px_560px_at_38%_78%,rgba(117,90,38,0.12),transparent_62%)]" />
      </div>

      <div className="absolute left-6 top-6 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-[color:var(--primary-container)]" />
        <div className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
          Studio Preview
        </div>
      </div>

      <div className="absolute inset-x-6 top-16 bottom-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {(["top", "bottom", "accessory"] as const).map((slot) => {
          const pick = picks.find((p) => p.slot === slot);
          return (
            <div
              key={slot}
              className="relative overflow-hidden rounded-lg border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-lowest)]"
            >
              {pick ? (
                <>
                  <Image
                    src={pick.product.image}
                    alt={pick.product.name}
                    fill
                    sizes="(min-width: 768px) 280px, 100vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent" />
                  <div className="absolute left-4 bottom-4">
                    <div className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-white/70">
                      {slot}
                    </div>
                    <div className="mt-1 font-[family-name:var(--font-display)] text-[20px] leading-[1.05] text-white">
                      {pick.product.name}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <div className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                    {slot}
                  </div>
                  <div className="mt-3 font-[family-name:var(--font-display)] text-[22px] text-[color:var(--text-primary)]">
                    Select a piece
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
