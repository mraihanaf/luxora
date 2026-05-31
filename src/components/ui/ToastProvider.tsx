"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastInput = {
  title: string;
  description?: string;
  actionLabel?: string;
  href?: string;
  durationMs?: number;
};

type ToastItem = ToastInput & {
  id: string;
};

type ToastContextValue = {
  pushToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((toast: ToastInput) => {
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    setToasts((prev) => [...prev, { ...toast, id }]);

    const durationMs = toast.durationMs ?? 4000;
    window.setTimeout(() => dismissToast(id), durationMs);
  }, [dismissToast]);

  const value = useMemo<ToastContextValue>(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-end gap-3 sm:inset-x-6 sm:bottom-6">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: () => void;
}) {
  return (
    <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-[color:var(--glass-border)] bg-[color:var(--surface-container-lowest)]/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-[family-name:var(--font-display)] text-[22px] leading-tight text-[color:var(--text-primary)]">
            {toast.title}
          </div>
          {toast.description ? (
            <div className="mt-2 text-[13px] leading-[1.7] text-[color:var(--text-secondary)]">
              {toast.description}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full p-2 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
      {toast.href && toast.actionLabel ? (
        <div className="mt-4">
          <Link
            href={toast.href}
            className="inline-flex items-center justify-center rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-low)] px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-primary)]"
          >
            {toast.actionLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
