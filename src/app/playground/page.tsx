"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCart } from "@/lib/cart/CartProvider";
import { emptyOutfit } from "@/lib/outfit/outfitSlots";
import type { Outfit, StorefrontProduct } from "@/lib/types";
import { OutfitBuilder } from "@/components/playground/OutfitBuilder";
import { OutfitStage } from "@/components/playground/OutfitStage";
import { VideoRecorder } from "@/components/playground/VideoRecorder";
import orpc from "@/lib/orpc/client";

export default function PlaygroundPage() {
  const { lines } = useCart();
  const listQuery = useQuery(orpc.listProducts.queryOptions());
  const authQuery = useQuery({
    ...orpc.getMe.queryOptions(),
    retry: false,
  });
  const [outfit, setOutfit] = useState<Outfit>(() => emptyOutfit());
  const [productsHash, setProductsHash] = useState<string | null>(null);

  const productMap = useMemo(() => {
    return new Map((listQuery.data ?? []).map((product) => [product.id, product]));
  }, [listQuery.data]);

  const wardrobeProducts = useMemo(() => {
    return lines
      .map((line) => productMap.get(line.productId))
      .filter((product): product is StorefrontProduct => Boolean(product));
  }, [lines, productMap]);

  const selectedProducts = useMemo(() => {
    return Object.values(outfit)
      .map((productId) => (productId ? productMap.get(productId) : null))
      .filter((product): product is StorefrontProduct => Boolean(product));
  }, [outfit, productMap]);

  const selectedIds = useMemo(() => {
    return Array.from(new Set(selectedProducts.map((product) => product.id)));
  }, [selectedProducts]);

  const isAuthed = Boolean(authQuery.data?.id);

  const generateMutation = useMutation(
    orpc.generateProductVideo.mutationOptions({
      onSuccess: (result) => {
        setProductsHash(result.productsHash);
      },
    }),
  );

  const videoQuery = useQuery({
    ...orpc.getProductVideo.queryOptions({
      input: { productsHash: productsHash ?? "" },
    }),
    enabled: Boolean(productsHash),
    refetchInterval: (query) => (query.state.data?.videoUrl ? false : 3000),
  });

  const displayedVideo = videoQuery.data ?? generateMutation.data ?? null;
  const workflowError = generateMutation.error?.message ?? videoQuery.error?.message ?? null;

  const updateOutfit = (next: Outfit) => {
    setOutfit(next);
    setProductsHash(null);
    generateMutation.reset();
  };

  const clearWorkflow = () => {
    updateOutfit(emptyOutfit());
  };

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

        {lines.length === 0 ? (
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

      {listQuery.isLoading ? (
        <div className="glass-card rounded-xl px-6 py-12 text-[14px] text-[color:var(--text-secondary)]">
          Loading wardrobe products...
        </div>
      ) : listQuery.error ? (
        <div className="glass-card rounded-xl px-6 py-12">
          <div className="font-[family-name:var(--font-display)] text-[28px] text-[color:var(--text-primary)]">
            Workflow unavailable.
          </div>
          <div className="mt-3 text-[14px] leading-[1.8] text-[color:var(--text-secondary)]">
            {listQuery.error.message}
          </div>
        </div>
      ) : wardrobeProducts.length === 0 ? (
        <div className="glass-card rounded-xl px-6 py-12">
          <div className="font-[family-name:var(--font-display)] text-[28px] text-[color:var(--text-primary)]">
            Add products to your wardrobe first.
          </div>
          <div className="mt-3 text-[14px] leading-[1.8] text-[color:var(--text-secondary)]">
            The playground uses the products saved from the collection page so you can assemble a
            valid lookbook combination.
          </div>
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-8">
              <OutfitStage picks={selectedProducts} />
            </div>
            <div className="lg:col-span-4">
              <OutfitBuilder
                wardrobeProducts={wardrobeProducts}
                outfit={outfit}
                setOutfit={updateOutfit}
                clearOutfit={clearWorkflow}
                canGenerate={selectedIds.length >= 1 && selectedIds.length <= 3}
                isGenerating={generateMutation.isPending}
                isAuthed={isAuthed}
                onGenerate={() => {
                  void generateMutation.mutateAsync({ productIds: selectedIds });
                }}
              />
            </div>
          </section>

          <section className="mt-10">
            <VideoRecorder
              picks={selectedProducts}
              video={displayedVideo}
              isStarting={generateMutation.isPending}
              isPolling={Boolean(productsHash) && !displayedVideo?.videoUrl}
              error={workflowError}
            />
          </section>
        </>
      )}
    </div>
  );
}
