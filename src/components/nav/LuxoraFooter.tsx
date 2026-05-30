"use client";

import Link from "next/link";

export function LuxoraFooter() {
  return (
    <footer className="w-full border-t border-[color:var(--outline-variant)] bg-[color:var(--surface-container-low)]">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-10 px-4 py-16 md:grid-cols-12 md:gap-8 md:px-16">
        <div className="md:col-span-4">
          <div className="font-[family-name:var(--font-display)] text-[34px] tracking-[-0.02em] text-[color:var(--text-primary)]">
            Luxora
          </div>
          <p className="mt-4 max-w-sm text-[14px] leading-[1.8] text-[color:var(--text-secondary)]">
            Invisible technology. Visible luxury. Elevating personal style through intelligent design
            and editorial restraint.
          </p>
        </div>

        <div className="md:col-span-2">
          <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-primary)]">
            Explore
          </div>
          <div className="mt-4 flex flex-col gap-3 text-[14px] text-[color:var(--text-secondary)]">
            <Link href="/catalog" className="hover:text-[color:var(--text-primary)]">
              Collections
            </Link>
            <Link href="/playground" className="hover:text-[color:var(--text-primary)]">
              Studio
            </Link>
            <Link href="/ideas" className="hover:text-[color:var(--text-primary)]">
              Ideas
            </Link>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-primary)]">
            Atelier
          </div>
          <div className="mt-4 flex flex-col gap-3 text-[14px] text-[color:var(--text-secondary)]">
            <Link href="/atelier" className="hover:text-[color:var(--text-primary)]">
              Sustainability
            </Link>
            <Link href="/editorial" className="hover:text-[color:var(--text-primary)]">
              Editorial
            </Link>
          </div>
        </div>

        <div className="md:col-span-4">
          <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-primary)]">
            Newsletter
          </div>
          <form className="mt-4 max-w-sm">
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <div className="rounded-md border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-lowest)]">
              <input
                id="footer-email"
                name="email"
                type="email"
                autoComplete="email"
                spellCheck={false}
                placeholder="Email Address"
                className="w-full bg-transparent px-4 py-3 text-[14px] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)]"
                required
              />
            </div>
          </form>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1440px] px-4 pb-10 md:px-16">
        <div className="border-t border-[color:var(--outline-variant)] pt-8 text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
          © 2026 Luxora Atelier. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

