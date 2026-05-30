"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { useCart } from "@/lib/cart/CartProvider";
import { productById } from "@/lib/products";

export default function CartPage() {
  const { lines, clear } = useCart();

  const totals = useMemo(() => {
    const subtotal = lines.reduce((sum, l) => {
      const p = productById.get(l.productId);
      return sum + (p ? p.price * l.qty : 0);
    }, 0);
    const shipping = 0;
    const total = subtotal + shipping;
    const items = lines.reduce((sum, l) => sum + l.qty, 0);
    return { subtotal, shipping, total, items };
  }, [lines]);

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-24 md:px-16">
      <nav className="mb-8 -mt-4">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
        >
          <span className="text-[color:var(--text-secondary)]">←</span>
          Back
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-x-16">
        <div className="lg:col-span-7 flex flex-col space-y-12">
          <nav
            aria-label="Checkout steps"
            className="flex items-center space-x-2 overflow-x-auto pb-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]"
          >
            <span className="whitespace-nowrap border-b border-[color:var(--text-primary)] pb-1 text-[color:var(--text-primary)]">
              Shipping
            </span>
            <span className="opacity-40">›</span>
            <span className="whitespace-nowrap">Payment</span>
            <span className="opacity-40">›</span>
            <span className="whitespace-nowrap">Review</span>
          </nav>

          <section className="space-y-8">
            <h1 className="font-[family-name:var(--font-display)] text-[44px] leading-[1.05] tracking-[-0.02em] text-[color:var(--text-primary)] md:text-[56px]">
              Shipping Information
            </h1>
            <form className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="first-name"
                    className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]"
                  >
                    First Name
                  </label>
                  <input
                    id="first-name"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    placeholder="Jane"
                    className="w-full border-b border-[color:var(--outline)] bg-[color:var(--surface-container-low)] py-3 text-[14px] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-secondary)]"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="last-name"
                    className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]"
                  >
                    Last Name
                  </label>
                  <input
                    id="last-name"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Doe"
                    className="w-full border-b border-[color:var(--outline)] bg-[color:var(--surface-container-low)] py-3 text-[14px] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-secondary)]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="address"
                  className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]"
                >
                  Address
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  autoComplete="street-address"
                  placeholder="123 Luxury Lane, Suite 400"
                  className="w-full border-b border-[color:var(--outline)] bg-[color:var(--surface-container-low)] py-3 text-[14px] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-secondary)]"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <label
                    htmlFor="city"
                    className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]"
                  >
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    autoComplete="address-level2"
                    placeholder="New York"
                    className="w-full border-b border-[color:var(--outline)] bg-[color:var(--surface-container-low)] py-3 text-[14px] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-secondary)]"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="region"
                    className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]"
                  >
                    State/Province
                  </label>
                  <input
                    id="region"
                    name="region"
                    type="text"
                    autoComplete="address-level1"
                    placeholder="NY"
                    className="w-full border-b border-[color:var(--outline)] bg-[color:var(--surface-container-low)] py-3 text-[14px] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-secondary)]"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="postal"
                    className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]"
                  >
                    Zip/Postal
                  </label>
                  <input
                    id="postal"
                    name="postalCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    placeholder="10001"
                    className="w-full border-b border-[color:var(--outline)] bg-[color:var(--surface-container-low)] py-3 text-[14px] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-secondary)]"
                  />
                </div>
              </div>
            </form>
          </section>

          <section className="space-y-6 border-t border-[color:var(--outline-variant)] pt-8">
            <div className="flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-display)] text-[28px] text-[color:var(--text-primary)]">
                Your Selection
              </h2>
              {lines.length ? (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Clear your wardrobe? This cannot be undone.")) clear();
                  }}
                  className="rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-lowest)] px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
                >
                  Clear
                </button>
              ) : null}
            </div>
            {lines.length === 0 ? (
              <div className="glass-card px-6 py-10">
                <div className="font-[family-name:var(--font-display)] text-[26px] text-[color:var(--text-primary)]">
                  Your wardrobe awaits.
                </div>
                <div className="mt-3 text-[14px] leading-[1.8] text-[color:var(--text-secondary)]">
                  Begin with Collections, then return here to refine the silhouette.
                </div>
                <div className="mt-6">
                  <Link
                    href="/catalog"
                    className="inline-flex items-center justify-center rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-low)] px-6 py-3 text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-primary)]"
                  >
                    Browse Collections
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {lines.map((l) => (
                  <CartLineItem key={l.productId} line={l} />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-28">
            <aside className="glass-card rounded-xl p-8">
              <h2 className="font-[family-name:var(--font-display)] text-[28px] text-[color:var(--text-primary)]">
                Order Summary
              </h2>
              <div className="mt-8 space-y-4 text-[14px] text-[color:var(--text-secondary)]">
                <Row label={`Subtotal (${totals.items} items)`} value={`$${totals.subtotal.toFixed(2)}`} />
                <Row label="Shipping" value={totals.subtotal ? "Complimentary" : "—"} />
                <Row label="Estimated Tax" value={totals.subtotal ? `$${(totals.subtotal * 0.08).toFixed(2)}` : "—"} />
              </div>
              <div className="mt-8 border-t border-[color:var(--outline-variant)] pt-6">
                <div className="flex items-end justify-between gap-4">
                  <div className="font-[family-name:var(--font-display)] text-[22px] text-[color:var(--text-primary)]">
                    Total
                  </div>
                  <div className="text-right">
                    <div className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                      USD
                    </div>
                    <div className="font-[family-name:var(--font-display)] text-[36px] tracking-[-0.02em] text-[color:var(--primary-container)]">
                      ${(totals.total + (totals.subtotal ? totals.subtotal * 0.08 : 0)).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href="/playground"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--primary-container)] py-5 text-[12px] uppercase tracking-[0.22em] text-[color:var(--on-primary)]"
              >
                Generate Mockup <span aria-hidden="true">→</span>
              </Link>
              <div className="mt-6 text-center font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)] opacity-60">
                Secure SSL Encrypted Checkout
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-[color:var(--text-secondary)]">{label}</div>
      <div
        className={[
          "font-[family-name:var(--font-mono)] text-[11px] tracking-[0.12em]",
          strong ? "text-[color:var(--text-primary)]" : "text-[color:var(--text-secondary)]",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}
