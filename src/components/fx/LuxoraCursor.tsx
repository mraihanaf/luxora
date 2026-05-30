"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mql = window.matchMedia(query);
      const handler = () => onStoreChange();
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function LuxoraCursor() {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const finePointer = useMediaQuery("(pointer: fine)");
  const enabled = finePointer && !reducedMotion;
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (dotRef.current) dotRef.current.style.opacity = "1";
      if (ringRef.current) ringRef.current.style.opacity = "1";
    };

    const onLeave = () => {
      if (dotRef.current) dotRef.current.style.opacity = "0";
      if (ringRef.current) ringRef.current.style.opacity = "0";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("blur", onLeave);
    window.addEventListener("pointerleave", onLeave);

    const tick = () => {
      const dx = target.current.x - pos.current.x;
      const dy = target.current.y - pos.current.y;
      pos.current.x += dx * 0.18;
      pos.current.y += dy * 0.18;

      const x = `${pos.current.x}px`;
      const y = `${pos.current.y}px`;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${x},${y},0)`;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${x},${y},0)`;
      raf.current = window.requestAnimationFrame(tick);
    };
    raf.current = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("pointerleave", onLeave);
      if (raf.current) window.cancelAnimationFrame(raf.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[70] h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[color:var(--glass-border-hi)] opacity-0 transition-opacity duration-300"
        style={{
          boxShadow: "0 0 28px var(--luxora-gold-glow)",
          backdropFilter: "blur(6px)",
        }}
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[70] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-300"
        style={{
          background: "radial-gradient(circle, var(--luxora-gold-light), var(--luxora-gold))",
          boxShadow: "0 0 18px var(--luxora-gold-glow)",
        }}
      />
    </>
  );
}
