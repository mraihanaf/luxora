"use client";

import { productById } from "@/lib/products";
import type { Outfit, OutfitSlotId, Product } from "@/lib/types";
import { OUTFIT_SLOTS } from "@/lib/outfit/outfitSlots";

export function OutfitBuilder({
  wardrobeIds,
  outfit,
  setOutfit,
  clearOutfit,
}: {
  wardrobeIds: string[];
  outfit: Outfit;
  setOutfit: (next: Outfit) => void;
  clearOutfit: () => void;
}) {
  const setSlot = (slot: OutfitSlotId, productId: string | null) => {
    setOutfit({ ...outfit, [slot]: productId });
  };

  const total = Object.values(outfit).reduce((sum, id) => {
    if (!id) return sum;
    const p = productById.get(id);
    return sum + (p ? p.price : 0);
  }, 0);

  return (
    <div className="glass-card flex h-full flex-col rounded-xl p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[color:var(--primary-container)]" aria-hidden="true">
            ✦
          </span>
          <div className="font-[family-name:var(--font-display)] text-[24px] text-[color:var(--text-primary)]">
            Your Fit
          </div>
        </div>
        <button
          type="button"
          onClick={clearOutfit}
          className="rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-lowest)] px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
        >
          Reset
        </button>
      </div>

      <div className="mt-8 space-y-4">
        {OUTFIT_SLOTS.map((slot) => {
          const options = wardrobeIds
            .map((id) => productById.get(id))
            .filter((p): p is Product => Boolean(p))
            .filter((p) => slot.accepts.includes(p.category));

          const selectedId = outfit[slot.id];

          return (
            <div
              key={slot.id}
              className="flex items-center gap-4 rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-lowest)] px-4 py-3 shadow-sm transition-colors hover:bg-[color:var(--surface-container-low)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-low)] text-[color:var(--text-secondary)]">
                ⌁
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                  {slot.label}
                </div>
                <div className="mt-1 truncate text-[14px] text-[color:var(--text-primary)]">
                  {selectedId ? productById.get(selectedId)?.name ?? "Unknown" : "Select a piece"}
                </div>
              </div>
              <select
                value={selectedId ?? ""}
                onChange={(e) => setSlot(slot.id, e.target.value || null)}
                className="max-w-[160px] rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-lowest)] px-3 py-2 text-[12px] text-[color:var(--text-primary)]"
                aria-label={`Select ${slot.label}`}
              >
                <option value="">—</option>
                {options.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      <div className="mt-10 border-t border-[color:var(--outline-variant)] pt-8">
        <div className="flex items-end justify-between">
          <div className="text-[14px] text-[color:var(--text-secondary)]">Total Outfit</div>
          <div className="font-[family-name:var(--font-display)] text-[24px] text-[color:var(--text-primary)]">
            ${total.toFixed(2)}
          </div>
        </div>
        <button
          type="button"
          className="mt-6 w-full rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-high)] py-4 text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)] hover:bg-[color:var(--primary-container)] hover:text-[color:var(--on-primary)]"
        >
          Generate Preview
        </button>
        <div className="mt-3 text-center font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)] opacity-60">
          Uses AI to simulate fabric physics
        </div>
      </div>
    </div>
  );
}
