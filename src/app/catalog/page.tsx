"use client";

import { useMemo, useState } from "react";
import { products } from "@/lib/products";
import type { ProductCategory, ProductTag } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";
import { cn } from "@/lib/cn";

type SortKey = "featured" | "priceAsc" | "priceDesc";

const CATEGORIES: Array<{ id: ProductCategory | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "top", label: "Tops" },
  { id: "bottom", label: "Bottoms" },
  { id: "accessory", label: "Accessories" },
];

const TAGS: ProductTag[] = [
  "new",
  "editorial",
  "tailored",
  "sheer",
  "liquid",
  "runway",
  "minimal",
  "night",
  "day",
  "sustainable",
];

export default function CatalogPage() {
  const [category, setCategory] = useState<ProductCategory | "all">("all");
  const [tag, setTag] = useState<ProductTag | "all">("all");
  const [sort, setSort] = useState<SortKey>("featured");
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = products.slice();
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (tag !== "all") list = list.filter((p) => p.tags.includes(tag));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (sort === "priceAsc") list.sort((a, b) => a.price - b.price);
    if (sort === "priceDesc") list.sort((a, b) => b.price - a.price);
    if (sort === "featured") {
      const score = (p: (typeof products)[number]) =>
        (p.tags.includes("new") ? 20 : 0) +
        (p.tags.includes("runway") ? 8 : 0) +
        (p.tags.includes("editorial") ? 6 : 0);
      list.sort((a, b) => score(b) - score(a));
    }
    return list;
  }, [category, tag, sort, query]);

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
                    Refine
                  </div>
                  <div className="mt-6">
                    <div className="text-[12px] text-[color:var(--text-secondary)]">Tags</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setTag("all")}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] transition-colors",
                          tag === "all"
                            ? "border-[color:var(--outline)] bg-[color:var(--surface-container-lowest)] text-[color:var(--text-primary)]"
                            : "border-[color:var(--outline-variant)] bg-[color:var(--surface-container-low)] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]",
                        )}
                      >
                        All
                      </button>
                      {TAGS.slice(0, 6).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTag(t)}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] transition-colors",
                            tag === t
                              ? "border-[color:var(--outline)] bg-[color:var(--surface-container-lowest)] text-[color:var(--text-primary)]"
                              : "border-[color:var(--outline-variant)] bg-[color:var(--surface-container-low)] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]",
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
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
                Season SS-26
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
                <option value="featured">Featured</option>
                <option value="priceAsc">Price ↑</option>
                <option value="priceDesc">Price ↓</option>
              </select>
            </div>
          </div>

          <div className="mt-10">
            {filtered.length === 0 ? (
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
              Tags
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTag("all")}
                className={cn(
                  "rounded-full border px-3 py-2 text-[11px] uppercase tracking-[0.22em] transition-colors",
                  tag === "all"
                    ? "border-[color:var(--outline)] bg-[color:var(--surface-container-low)] text-[color:var(--text-primary)]"
                    : "border-[color:var(--outline-variant)] bg-[color:var(--surface-container-lowest)] text-[color:var(--text-secondary)]",
                )}
              >
                All
              </button>
              {TAGS.slice(0, 10).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  className={cn(
                    "rounded-full border px-3 py-2 text-[11px] uppercase tracking-[0.22em] transition-colors",
                    tag === t
                      ? "border-[color:var(--outline)] bg-[color:var(--surface-container-low)] text-[color:var(--text-primary)]"
                      : "border-[color:var(--outline-variant)] bg-[color:var(--surface-container-lowest)] text-[color:var(--text-secondary)]",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
