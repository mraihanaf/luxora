"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/lib/cart/CartProvider";
import { useTheme } from "@/lib/theme/ThemeProvider";

type NavItem = {
  href: string;
  label: string;
};

const NAV: NavItem[] = [
  { href: "/catalog", label: "Collections" },
  { href: "/playground", label: "Studio" },
  { href: "/ideas", label: "Ideas" },
  { href: "/atelier", label: "Atelier" },
  { href: "/editorial", label: "Editorial" },
];

function NavLinks({
  activeHref,
  onNavigate,
}: {
  activeHref: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
      {NAV.map((item) => {
        const active = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={[
              "relative py-2 text-[12px] uppercase tracking-[0.22em] transition-colors",
              active
                ? "text-[color:var(--text-primary)]"
                : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]",
            ].join(" ")}
          >
            {item.label}
            <span
              className={[
                "absolute left-0 right-0 -bottom-0.5 h-px origin-left transition-transform duration-300",
                "bg-[color:var(--text-primary)]",
                active ? "scale-x-100" : "scale-x-0",
              ].join(" ")}
            />
          </Link>
        );
      })}
    </div>
  );
}

function Icon({
  name,
  className,
}: {
  name: "search" | "bag" | "user" | "menu" | "close";
  className?: string;
}) {
  const common = { className, "aria-hidden": true as const, viewBox: "0 0 24 24" };
  if (name === "search") {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    );
  }
  if (name === "bag") {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
        <path d="M7 7V6a5 5 0 0 1 10 0v1" />
        <path d="M6 7h12l-1 14H7L6 7Z" />
      </svg>
    );
  }
  if (name === "user") {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M20 21a8 8 0 0 0-16 0" />
        <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      </svg>
    );
  }
  if (name === "menu") {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </svg>
    );
  }
  return (
    <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

export function LuxoraNav() {
  const pathname = usePathname();
  const { totalQty } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (drawerOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  const activeHref = useMemo(() => {
    if (!pathname) return "/";
    if (pathname === "/") return "/";
    const top = `/${pathname.split("/").filter(Boolean)[0] ?? ""}`;
    return top === "/" ? "/" : top;
  }, [pathname]);

  return (
    <>
      <header
        className={[
          "fixed top-0 left-0 right-0 z-50",
          "border-b border-[color:var(--outline-variant)]",
          "transition-colors duration-200",
          scrolled ? "bg-[color:var(--surface-container-lowest)]/92" : "bg-[color:var(--surface-container-lowest)]/80",
          "backdrop-blur-xl",
        ].join(" ")}
      >
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 md:px-16">
          <nav className="hidden md:flex items-center gap-8">
            <NavLinks activeHref={activeHref} />
          </nav>

          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-[28px] tracking-[-0.02em] text-[color:var(--text-primary)]"
            aria-label="Luxora home"
          >
            Luxora
          </Link>

          <div className="hidden md:flex items-center gap-5 text-[color:var(--text-primary)]">
            <button type="button" className="opacity-80 hover:opacity-100" aria-label="Search">
              <Icon name="search" className="h-5 w-5" />
            </button>
            <Link href="/cart" className="relative opacity-80 hover:opacity-100" aria-label="Open wardrobe">
              <Icon name="bag" className="h-5 w-5" />
              {totalQty > 0 ? (
                <span className="absolute -right-2 -top-2 min-w-5 rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-lowest)] px-1.5 py-0.5 text-center text-[10px] font-medium leading-none text-[color:var(--text-primary)]">
                  {totalQty}
                </span>
              ) : null}
            </Link>
            <button type="button" className="opacity-80 hover:opacity-100" aria-label="Account">
              <Icon name="user" className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-lowest)] px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>

          <div className="flex items-center gap-4 md:hidden">
            <button type="button" onClick={() => setDrawerOpen(true)} aria-label="Open navigation menu">
              <Icon name="menu" className="h-6 w-6 text-[color:var(--text-primary)]" />
            </button>
            <Link href="/cart" className="relative" aria-label="Open wardrobe">
              <Icon name="bag" className="h-6 w-6 text-[color:var(--text-primary)]" />
              {totalQty > 0 ? (
                <span className="absolute -right-2 -top-2 min-w-5 rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-lowest)] px-1.5 py-0.5 text-center text-[10px] font-medium leading-none text-[color:var(--text-primary)]">
                  {totalQty}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </header>

      <div
        className={[
          "fixed inset-0 z-[60] md:hidden",
          drawerOpen ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
        aria-hidden={!drawerOpen}
      >
        <button
          type="button"
          className={[
            "absolute inset-0 transition-opacity duration-200",
            drawerOpen ? "opacity-100" : "opacity-0",
            "bg-black/35",
          ].join(" ")}
          onClick={() => setDrawerOpen(false)}
          tabIndex={drawerOpen ? 0 : -1}
          aria-label="Close navigation menu"
        />
        <div
          className={[
            "absolute left-0 top-0 bottom-0 w-[min(360px,calc(100%-48px))]",
            "bg-[color:var(--surface-container-lowest)]",
            "border-r border-[color:var(--outline-variant)]",
            "p-6 overscroll-contain overflow-y-auto",
            "transition-transform duration-300 ease-out",
            drawerOpen ? "translate-x-0" : "-translate-x-[120%]",
          ].join(" ")}
          role="dialog"
          aria-label="Navigation drawer"
        >
          <div className="flex items-center justify-between">
            <div className="font-[family-name:var(--font-display)] text-[26px] tracking-[-0.02em] text-[color:var(--text-primary)]">
              Luxora
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close navigation menu"
            >
              <Icon name="close" className="h-6 w-6 text-[color:var(--text-primary)]" />
            </button>
          </div>

          <div className="mt-10">
            <NavLinks activeHref={activeHref} onNavigate={() => setDrawerOpen(false)} />
          </div>

          <div className="mt-12 border-t border-[color:var(--outline-variant)] pt-6">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-container-low)] px-4 py-3 text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
            >
              Switch to {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
