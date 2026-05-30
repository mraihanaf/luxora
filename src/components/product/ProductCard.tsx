"use client";

import Image from "next/image";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart/CartProvider";
import { cn } from "@/lib/cn";

export function ProductCard({
  product,
  featured,
}: {
  product: Product;
  featured?: boolean;
}) {
  const { add } = useCart();

  return (
    <article className="group cursor-pointer">
      <div className="relative mb-6 aspect-[3/4] overflow-hidden rounded-sm border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-low)] shadow-sm">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 420px, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          priority={featured}
        />
        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <button
            type="button"
            onClick={() => add(product.id, 1)}
            className={cn(
              "w-full rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface)] py-4",
              "text-[12px] uppercase tracking-[0.22em] text-[color:var(--on-surface)]",
              "opacity-0 translate-y-5 transition-all duration-300",
              "group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0",
            )}
          >
            Add to Wardrobe
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-[family-name:var(--font-display)] text-[24px] leading-[1.1] text-[color:var(--text-primary)]">
          {product.name}
        </h3>
        <p className="mt-1 text-[14px] text-[color:var(--text-secondary)]">
          ${product.price.toFixed(0)}
        </p>
      </div>
    </article>
  );
}
