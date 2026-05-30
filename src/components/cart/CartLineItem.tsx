"use client";

import Image from "next/image";
import { useCart } from "@/lib/cart/CartProvider";
import { QtyStepper } from "@/components/cart/QtyStepper";
import { formatIdr, productTypeLabels } from "@/lib/storefront";
import type { CartLine, StorefrontProduct } from "@/lib/types";

export function CartLineItem({
  line,
  product,
}: {
  line: CartLine
  product: StorefrontProduct
}) {
  const { remove, setQty } = useCart();

  return (
    <div className="glass-card flex gap-6 rounded-lg p-4 transition-transform duration-300 hover:translate-x-1">
      <div className="relative w-24 flex-shrink-0 overflow-hidden rounded-sm border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-high)] md:w-32">
        <div className="aspect-[3/4]" />
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="128px"
          className="object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="truncate font-[family-name:var(--font-display)] text-[22px] leading-tight text-[color:var(--text-primary)]">
              {product.name}
            </div>
            <div className="mt-2 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
              Type: {productTypeLabels[product.type]}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Remove ${product.name} from your wardrobe?`)) remove(product.id);
            }}
            aria-label={`Remove ${product.name}`}
            className="rounded-full p-2 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
          >
            ✕
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <QtyStepper qty={line.qty} onChange={(n) => setQty(product.id, n)} />
          <div className="font-[family-name:var(--font-mono)] text-[12px] tracking-[0.06em] text-[color:var(--text-primary)]">
            {formatIdr(product.priceIdr * line.qty)}
          </div>
        </div>
      </div>
    </div>
  );
}
