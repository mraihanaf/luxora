"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { useCart } from "@/lib/cart/CartProvider";
import { emptyOutfit } from "@/lib/outfit/outfitSlots";
import type { Outfit, StorefrontProduct, StorefrontProductVideoStatus } from "@/lib/types";
import { OutfitBuilder } from "@/components/playground/OutfitBuilder";
import { OutfitStage } from "@/components/playground/OutfitStage";
import { VideoRecorder } from "@/components/playground/VideoRecorder";
import orpc from "@/lib/orpc/client";
import type { generateProductVideo } from "@/trigger/generate-product-video";

const clampProgress = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

export default function PlaygroundPage() {
  const { lines } = useCart();
  const queryClient = useQueryClient();
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

  const productVideoQueryOptions = orpc.getProductVideo.queryOptions({
    input: { productsHash: productsHash ?? "" },
  });
  const videoQuery = useQuery({
    ...productVideoQueryOptions,
    enabled: Boolean(productsHash),
    refetchInterval: (query) =>
      query.state.data?.videoUrl || query.state.data?.workflowStatus === "FAILED" ? false : 3000,
  });

  const displayedVideo = videoQuery.data ?? generateMutation.data ?? null;
  const realtimeSessionQuery = useQuery({
    ...orpc.getProductVideoRealtimeSession.queryOptions({
      input: { productsHash: productsHash ?? "" },
    }),
    enabled: Boolean(
      productsHash &&
        displayedVideo?.triggerRunId &&
        !displayedVideo.videoUrl &&
        displayedVideo.workflowStatus !== "FAILED",
    ),
    retry: false,
    staleTime: 45 * 60 * 1000,
  });
  const realtimeRun = useRealtimeRun<typeof generateProductVideo>(realtimeSessionQuery.data?.runId, {
    accessToken: realtimeSessionQuery.data?.accessToken,
    enabled: Boolean(realtimeSessionQuery.data?.runId && realtimeSessionQuery.data?.accessToken),
    onComplete: () => {
      void queryClient.invalidateQueries({ queryKey: productVideoQueryOptions.queryKey });
    },
  });

  const realtimeMetadata = realtimeRun.run?.metadata as
    | {
        progressPercent?: number;
        progressLabel?: string;
        workflowStatus?: StorefrontProductVideoStatus;
      }
    | undefined;

  const workflowStatus =
    realtimeMetadata?.workflowStatus ??
    displayedVideo?.workflowStatus ??
    (generateMutation.isPending ? "PENDING" : undefined);
  const progressPercent =
    typeof realtimeMetadata?.progressPercent === "number"
      ? clampProgress(realtimeMetadata.progressPercent)
      : displayedVideo?.progressPercent ??
        (generateMutation.isPending ? 5 : selectedIds.length ? 0 : 0);
  const progressLabel =
    realtimeMetadata?.progressLabel ??
    displayedVideo?.progressLabel ??
    (generateMutation.isPending ? "Queued render" : null);
  const realtimeState =
    !productsHash || displayedVideo?.videoUrl || workflowStatus === "FAILED"
      ? "idle"
      : realtimeRun.error
        ? "offline"
        : realtimeRun.run
          ? "live"
          : realtimeSessionQuery.isLoading
            ? "connecting"
            : "waiting";
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
              workflowStatus={workflowStatus ?? null}
              progressPercent={progressPercent}
              progressLabel={progressLabel}
              realtimeState={realtimeState}
              error={workflowError}
            />
          </section>
        </>
      )}
    </div>
  );
}
