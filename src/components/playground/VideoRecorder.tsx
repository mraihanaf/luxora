"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { productById } from "@/lib/products";
import type { Outfit, Product } from "@/lib/types";

type RecordingState = "idle" | "recording" | "ready" | "error";

const pickMime = () => {
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  for (const c of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(c)) return c;
  }
  return "";
};

export function VideoRecorder({ outfit }: { outfit: Outfit }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [state, setState] = useState<RecordingState>("idle");
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const picks = useMemo(() => {
    const items = Object.values(outfit)
      .map((id) => (id ? productById.get(id) : null))
      .filter((p): p is Product => Boolean(p));
    return items;
  }, [outfit]);

  const renderFrame = useCallback(
    (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#060f09");
      g.addColorStop(1, "#0d2117");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      const glow = ctx.createRadialGradient(w * 0.5, h * 0.22, 0, w * 0.5, h * 0.22, h * 0.7);
      glow.addColorStop(0, "rgba(201,168,76,0.16)");
      glow.addColorStop(0.6, "rgba(201,168,76,0.05)");
      glow.addColorStop(1, "rgba(201,168,76,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.globalAlpha = 0.22;
      for (let i = 0; i < 90; i++) {
        const px = (i * 97) % w;
        const py = ((i * 53) % h) * 0.92;
        const r = 1 + ((i * 7) % 3);
        const tw = 0.45 + 0.55 * Math.sin(t * 2 + i);
        ctx.fillStyle = `rgba(201,168,76,${0.08 + tw * 0.08})`;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      const floatY = Math.sin(t * 1.6) * 8;
      const cx = w * 0.5;
      const cy = h * 0.48 + floatY;

      ctx.strokeStyle = "rgba(240,237,230,0.52)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - h * 0.3);
      ctx.bezierCurveTo(cx + 36, cy - h * 0.26, cx + 60, cy - h * 0.16, cx + 34, cy - h * 0.05);
      ctx.bezierCurveTo(cx + 24, cy + h * 0.02, cx + 24, cy + h * 0.12, cx + 12, cy + h * 0.18);
      ctx.bezierCurveTo(cx + 6, cy + h * 0.24, cx + 6, cy + h * 0.3, cx, cy + h * 0.35);
      ctx.bezierCurveTo(cx - 6, cy + h * 0.3, cx - 6, cy + h * 0.24, cx - 12, cy + h * 0.18);
      ctx.bezierCurveTo(cx - 24, cy + h * 0.12, cx - 24, cy + h * 0.02, cx - 34, cy - h * 0.05);
      ctx.bezierCurveTo(cx - 60, cy - h * 0.16, cx - 36, cy - h * 0.26, cx, cy - h * 0.3);
      ctx.stroke();

      ctx.strokeStyle = "rgba(201,168,76,0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.26, cy - h * 0.12);
      ctx.quadraticCurveTo(cx, cy - h * 0.22, cx + w * 0.28, cy - h * 0.09);
      ctx.stroke();

      const cards = picks.slice(0, 5);
      const angles = [220, 160, 35, 330, 85].map((a) => (a * Math.PI) / 180);
      const baseR = Math.min(w, h) * 0.3;
      cards.forEach((p, i) => {
        const a = angles[i % angles.length] + Math.sin(t * 0.8 + i) * 0.06;
        const r = baseR + Math.sin(t * 1.3 + i * 2) * 12;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r * 0.8;
        const cw = 220;
        const ch = 86;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.sin(t * 0.6 + i) * 0.03);
        ctx.globalAlpha = 0.96;

        ctx.fillStyle = "rgba(255,255,255,0.06)";
        ctx.strokeStyle = "rgba(201,168,76,0.28)";
        ctx.lineWidth = 1.2;
        roundRect(ctx, -cw / 2, -ch / 2, cw, ch, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "rgba(0,0,0,0.22)";
        roundRect(ctx, -cw / 2 + 10, -ch / 2 + 10, cw - 20, ch - 20, 12);
        ctx.fill();

        ctx.fillStyle = "rgba(201,168,76,0.9)";
        ctx.font = "12px 'Space Mono', ui-monospace, monospace";
        ctx.textBaseline = "top";
        ctx.fillText(p.category.toUpperCase(), -cw / 2 + 18, -ch / 2 + 16);

        ctx.fillStyle = "rgba(240,237,230,0.92)";
        ctx.font = "20px 'Cormorant Garamond', Georgia, serif";
        ctx.textBaseline = "alphabetic";
        const name = p.name.length > 22 ? `${p.name.slice(0, 22)}…` : p.name;
        ctx.fillText(name, -cw / 2 + 18, -ch / 2 + 56);

        ctx.restore();
      });

      ctx.fillStyle = "rgba(240,237,230,0.62)";
      ctx.font = "12px 'Space Mono', ui-monospace, monospace";
      ctx.textBaseline = "bottom";
      ctx.fillText("LUXORA · OUTFIT MOCKUP", 18, h - 18);

      ctx.fillStyle = "rgba(201,168,76,0.62)";
      ctx.fillText("✦", w - 28, h - 18);
    },
    [picks],
  );

  const record = useCallback(async () => {
    setError(null);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const mimeType = pickMime();
    if (!mimeType) {
      setState("error");
      setError("This browser cannot export WebM video.");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setState("error");
      setError("Canvas context is unavailable.");
      return;
    }

    const w = 960;
    const h = 540;
    canvas.width = w;
    canvas.height = h;

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.onerror = () => {
      setState("error");
      setError("Something interrupted us. Please try once more.");
    };

    setState("recording");
    setProgress(0);
    recorder.start();

    const started = performance.now();
    const duration = 7800;

    const loop = () => {
      const now = performance.now();
      const elapsed = now - started;
      const t = elapsed / 1000;
      renderFrame(ctx, t, w, h);
      setProgress(Math.min(1, elapsed / duration));

      if (elapsed < duration) requestAnimationFrame(loop);
      else recorder.stop();
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setState("ready");
      setProgress(1);
    };

    requestAnimationFrame(loop);
  }, [downloadUrl, renderFrame]);

  const disabled = state === "recording";

  return (
    <div className="glass-card p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
            Export
          </div>
          <div className="mt-2 font-[family-name:var(--font-display)] text-[34px] font-light text-[color:var(--text-primary)]">
            Video mockup
          </div>
          <div className="mt-4 max-w-xl text-[14px] leading-[1.8] text-[color:var(--text-secondary)]">
            Generates a short WebM animation. The video uses a Luxora-styled stage that stays
            consistent across devices.
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={record}
            disabled={disabled}
            className={[
              "glass-btn rounded-full px-6 py-3 text-[12px] uppercase tracking-[0.18em]",
              "text-[color:var(--text-primary)]",
              disabled ? "opacity-60 cursor-not-allowed" : "",
            ].join(" ")}
          >
            {state === "recording" ? "Curating…" : "Record .webm"}
          </button>
          {downloadUrl ? (
            <a
              href={downloadUrl}
              download="luxora-outfit.webm"
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] px-6 py-3 text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)] transition-colors hover:text-[color:var(--text-primary)]"
            >
              Download
            </a>
          ) : null}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-[color:var(--glass-border)] bg-[color:var(--glass-surface)] p-4">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
          <span>Status</span>
          <span className="text-[color:var(--text-secondary)]">
            {state === "idle" ? "Ready" : state === "recording" ? "Recording" : state === "ready" ? "Ready" : "Error"}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/25">
          <div
            className="h-full rounded-full bg-[color:var(--luxora-gold)] transition-[width] duration-150"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        {error ? (
          <div className="mt-3 text-[13px] text-[color:var(--text-secondary)]">{error}</div>
        ) : null}
      </div>

      <canvas ref={canvasRef} className="mt-6 w-full rounded-2xl border border-[color:var(--glass-border)]" />
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
