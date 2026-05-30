"use client";

import { cn } from "@/lib/cn";

export function QtyStepper({
  qty,
  onChange,
}: {
  qty: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-highest)] px-1">
      <button
        type="button"
        className={cn(
          "rounded-full px-3 py-1.5 text-[14px] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]",
        )}
        onClick={() => onChange(qty - 1)}
        aria-label="Decrease quantity"
      >
        –
      </button>
      <div className="px-3 py-2 font-[family-name:var(--font-mono)] text-[11px] tracking-[0.12em] text-[color:var(--text-primary)]">
        {qty}
      </div>
      <button
        type="button"
        className={cn(
          "rounded-full px-3 py-1.5 text-[14px] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]",
        )}
        onClick={() => onChange(qty + 1)}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
