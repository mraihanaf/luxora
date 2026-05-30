"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product/ProductCard";
import { cn } from "@/lib/cn";
import orpc from "@/lib/orpc/client";
import { productTypeLabels } from "@/lib/storefront";
import type { StorefrontProductType } from "@/lib/types";

type SortKey = "newest" | "priceAsc" | "priceDesc";

const CATEGORIES: Array<{ id: StorefrontProductType | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "TOP", label: productTypeLabels.TOP },
  { id: "BOTTOM", label: productTypeLabels.BOTTOM },
  { id: "HEADWEAR", label: productTypeLabels.HEADWEAR },
];

export default function CatalogPage() {
  const listQuery = useQuery(orpc.listProducts.queryOptions());
  const [category, setCategory] = useState<StorefrontProductType | "all">("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = (listQuery.data ?? []).slice();
    if (category !== "all") list = list.filter((p) => p.type === category);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (sort === "priceAsc") list.sort((a, b) => a.priceIdr - b.priceIdr);
    if (sort === "priceDesc") list.sort((a, b) => b.priceIdr - a.priceIdr);
    return list;
  }, [category, listQuery.data, query, sort]);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-24 md:px-16">
      <div className="flex flex-col gap-8 md:flex-row md:gap-10">
        <aside className="hidden w-72 shrink-0 md:block">
          <div className="sticky top-28">
            <div className="glass-card rounded-lg p-8">
              <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-primary)]">
                Categories
              </div>
              <div className="mt-8 space-y-6">
                <div className="flex flex-col space-y-3 border-l border-[color:var(--outline-variant)] pl-4">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      className={cn(
                        "text-left text-[12px] uppercase tracking-[0.18em] transition-colors",
                        category === c.id
                          ? "text-[color:var(--text-primary)]"
                          : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]",
                      )}
                    >
                      {c.label === "All" ? "All Pieces" : c.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label
                    htmlFor="catalog-query"
                    className="sr-only"
                  >
                    Search the collection
                  </label>
                  <input
                    id="catalog-query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search the collection…"
                    className="w-full rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-lowest)] px-4 py-3 text-[14px] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-secondary)]"
                  />
                </div>

                <div className="border-t border-[color:var(--outline-variant)] pt-8">
                  <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-primary)]">
                    Sort
                  </div>
                  <div className="mt-6">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortKey)}
                      className="w-full rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-lowest)] px-4 py-3 text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-primary)]"
                      aria-label="Sort products"
                    >
                      <option value="newest">Newest</option>
                      <option value="priceAsc">Price ↑</option>
                      <option value="priceDesc">Price ↓</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-8 flex items-center justify-between md:hidden">
            <h1 className="font-[family-name:var(--font-display)] text-[32px] tracking-[-0.02em] text-[color:var(--text-primary)]">
              Collections
            </h1>
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="glass-card rounded-md p-2 text-[color:var(--text-primary)]"
              aria-label="Open filters"
            >
              Filters
            </button>
          </div>

          <div className="hidden items-end justify-between gap-6 md:flex">
            <div>
              <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                Collections
              </div>
              <h1 className="mt-3 font-[family-name:var(--font-display)] text-[48px] leading-[1.05] tracking-[-0.02em] text-[color:var(--text-primary)]">
                Database Collection
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-[12px] text-[color:var(--text-secondary)]">
                Showing {filtered.length} Pieces
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-lowest)] px-4 py-3 text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-primary)]"
                aria-label="Sort products"
              >
                <option value="newest">Newest</option>
                <option value="priceAsc">Price ↑</option>
                <option value="priceDesc">Price ↓</option>
              </select>
            </div>
          </div>

          <div className="mt-10">
            {listQuery.isLoading ? (
              <div className="glass-card px-6 py-14 text-center">
                <div className="font-[family-name:var(--font-display)] text-3xl text-[color:var(--text-primary)]">
                  Loading collection...
                </div>
              </div>
            ) : listQuery.error ? (
              <div className="glass-card px-6 py-14 text-center">
                <div className="font-[family-name:var(--font-display)] text-3xl text-[color:var(--text-primary)]">
                  Collection unavailable.
                </div>
                <div className="mt-3 text-[14px] text-[color:var(--text-secondary)]">
                  {listQuery.error.message}
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="glass-card px-6 py-14 text-center">
                <div className="font-[family-name:var(--font-display)] text-3xl text-[color:var(--text-primary)]">
                  No matches.
                </div>
                <div className="mt-3 text-[14px] text-[color:var(--text-secondary)]">
                  Adjust filters to reveal a new selection.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p, i) => (
                  <ProductCard key={p.id} product={p} featured={i < 3} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={[
          "fixed inset-0 z-[70] md:hidden",
          filtersOpen ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
        aria-hidden={!filtersOpen}
      >
        <button
          type="button"
          className={[
            "absolute inset-0 bg-black/30 transition-opacity",
            filtersOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
          onClick={() => setFiltersOpen(false)}
          aria-label="Close filters"
        />
        <div
          className={[
            "absolute left-0 top-0 bottom-0 w-[min(360px,calc(100%-48px))]",
            "bg-[color:var(--surface-container-lowest)]",
            "border-r border-[color:var(--outline-variant)]",
            "p-6 overflow-y-auto overscroll-contain",
            "transition-transform duration-300 ease-out",
            filtersOpen ? "translate-x-0" : "-translate-x-[120%]",
          ].join(" ")}
          role="dialog"
          aria-label="Filters"
        >
          <div className="flex items-center justify-between">
            <div className="font-[family-name:var(--font-display)] text-[26px] tracking-[-0.02em] text-[color:var(--text-primary)]">
              Filters
            </div>
            <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
              ✕
            </button>
          </div>

          <div className="mt-8">
            <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-primary)]">
              Categories
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    "rounded-full border px-4 py-3 text-left text-[12px] uppercase tracking-[0.18em] transition-colors",
                    category === c.id
                      ? "border-[color:var(--outline)] bg-[color:var(--surface-container-low)] text-[color:var(--text-primary)]"
                      : "border-[color:var(--outline-variant)] bg-[color:var(--surface-container-lowest)] text-[color:var(--text-secondary)]",
                  )}
                >
                  {c.label === "All" ? "All Pieces" : c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-[color:var(--outline-variant)] pt-8">
            <label
              htmlFor="catalog-search"
              className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-primary)]"
            >
              Search
            </label>
            <input
              id="catalog-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the collection…"
              className="mt-4 w-full rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-lowest)] px-4 py-3 text-[14px] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-secondary)]"
            />
          </div>

          <div className="mt-8 border-t border-[color:var(--outline-variant)] pt-8">
            <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-primary)]">
              Sort
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="mt-4 w-full rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-lowest)] px-4 py-3 text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-primary)]"
              aria-label="Sort products"
            >
              <option value="newest">Newest</option>
              <option value="priceAsc">Price ↑</option>
              <option value="priceDesc">Price ↓</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
