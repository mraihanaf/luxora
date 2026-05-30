"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart/CartProvider";
import { emptyOutfit } from "@/lib/outfit/outfitSlots";
import type { Outfit } from "@/lib/types";
import { OutfitBuilder } from "@/components/playground/OutfitBuilder";
import { OutfitStage } from "@/components/playground/OutfitStage";
import { VideoRecorder } from "@/components/playground/VideoRecorder";

export default function PlaygroundPage() {
  const { lines } = useCart();
  const wardrobeIds = useMemo(() => lines.map((l) => l.productId), [lines]);
  const [outfit, setOutfit] = useState<Outfit>(() => emptyOutfit());

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-24 md:px-16">
      <header className="mb-16">
        <h1 className="font-[family-name:var(--font-display)] text-[52px] leading-[1.05] tracking-[-0.02em] text-[color:var(--text-primary)] md:text-[64px]">
          Outfit Studio
        </h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-[1.8] text-[color:var(--text-secondary)]">
          Step into the virtual atelier. Mix, match, and visualize your curated selections through
          our neural rendering engine.
        </p>

        {wardrobeIds.length === 0 ? (
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-low)] px-6 py-3 text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-primary)]"
            >
              Add Pieces From Collections
            </Link>
            <Link
              href="/cart"
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-lowest)] px-6 py-3 text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
            >
              Wardrobe →
            </Link>
          </div>
        ) : null}
      </header>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-8">
          <OutfitStage outfit={outfit} />
        </div>
        <div className="lg:col-span-4">
          <OutfitBuilder
            wardrobeIds={wardrobeIds}
            outfit={outfit}
            setOutfit={setOutfit}
            clearOutfit={() => setOutfit(emptyOutfit())}
          />
        </div>
      </section>

      <section className="mt-10">
        <VideoRecorder outfit={outfit} />
      </section>
    </div>
  );
}
