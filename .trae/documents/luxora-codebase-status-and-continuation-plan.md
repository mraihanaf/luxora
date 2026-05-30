# Plan: Luxora Codebase Status & Continuation (Polish + A11y)

## Summary

* Goal: understand current Luxora frontend codebase, capture current progress vs the original plan, and define next execution steps focused on polish + Web Interface Guidelines accessibility/UX fixes.

* User decisions: prioritize polish + A11y; keep cart session-only; keep theme persistence (localStorage) as-is.

* New direction: you have an updated design you want applied to the existing app (scope: everything). You’ll provide it as a `.zip` design handoff.

## Design Handoff (How To Give Me Your Design)

* Preferred workflow:

  * Extract your `.zip` into the repo at `luxora/design-handoff/` (create folder if needed).

  * Tell me the folder path after extraction, C:\Users\Gilbert\Documents\GitHub\TRAE-hackaton\luxora\stitch\_luxora\_outfit\_studio.

* What to include inside the zip (any subset is fine; more is faster):

  * `README.md` describing the design goals + what changed vs current.

  * `screens/` with page screenshots (desktop + mobile) for: home, catalog, cart, playground.

  * `tokens/` with one of:

    * `tokens.css` (CSS variables), or

    * `tailwind-snippets.txt` (preferred classes/patterns), or

    * `tokens.json` (colors/typography/radii/shadows).

  * `components/` with example HTML/CSS snippets (even partial) for key components (nav, product card, cart row).

  * `assets/` with icons/logos/background textures (SVG/PNG/WebP).

* If your zip contains a Figma export:

  * Export frames as PNG (1x or 2x) into `screens/`.

  * Export tokens (colors/type styles) into `tokens/` if you have them; otherwise screenshots are still workable.

## Current State Analysis

### Tech stack

* Next.js `16.2.6`, React `19.2.4`, Tailwind `v4` ([package.json](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/package.json)).

* App Router structure in [src/app](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app).

* Styling + theme tokens in [globals.css](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/globals.css) using CSS variables + Tailwind utilities.

### Runtime architecture (how the app works)

* Routing (App Router pages):

  * Home: [src/app/page.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/page.tsx)

  * Catalog: [src/app/catalog/page.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/catalog/page.tsx)

  * Cart: [src/app/cart/page.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/cart/page.tsx)

  * Playground: [src/app/playground/page.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/playground/page.tsx)

* Global layout: [layout.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/layout.tsx)

  * Wraps app with [ThemeProvider](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/lib/theme/ThemeProvider.tsx) (persists to localStorage) and [CartProvider](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/lib/cart/CartProvider.tsx) (session-only, in-memory).

  * Adds global navigation [LuxoraNav](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/components/nav/LuxoraNav.tsx) and optional FX cursor [LuxoraCursor](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/components/fx/LuxoraCursor.tsx) (disabled for reduced-motion / non-fine pointers).

* Data model:

  * Local product catalog in [products.ts](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/lib/products.ts) using the required `text_to_image` endpoint; lookup map `productById`.

  * Shared types in [types.ts](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/lib/types.ts).

  * Outfit slots in [outfitSlots.ts](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/lib/outfit/outfitSlots.ts).

* Media export:

  * WebM recording via Canvas + `MediaRecorder` in [VideoRecorder](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/components/playground/VideoRecorder.tsx).

### Progress vs prior plan

The earlier plan document [luxora-shopping-frontend-plan.md](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/.trae/documents/luxora-shopping-frontend-plan.md) is largely implemented:

* Routes: Home / Catalog / Cart / Playground exist and are styled to match `luxora-design.md`.

* Theme: dark + light mode implemented via `data-theme="light"` overrides in globals, toggle in nav.

* Cart: session-only provider + quantity editing + totals.

* Playground: outfit selection + stage preview + WebM export.

* Next Image remote config added in [next.config.ts](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/next.config.ts) for the required image host.

Remaining work is mostly quality: accessibility, interactions, and guideline compliance.

## Web Interface Guidelines Audit (Findings)

## src/app/globals.css

src/app/globals.css:140 - `transition: all` (guideline: list properties explicitly)

## src/app/page.tsx

src/app/page.tsx:223 - email input lacks label/aria-label
src/app/page.tsx:223 - email input missing `name` + `autoComplete="email"` (and `spellCheck={false}` recommended)
src/app/page.tsx:228 - `focus:outline-none focus:ring-0` removes focus affordance on keyboard focus unless replaced

## src/app/catalog/page.tsx

src/app/catalog/page.tsx:125 - `outline-none` on `<select>`; ensure a visible focus style exists
src/app/catalog/page.tsx:33 - catalog filter/sort state is not reflected in URL (deep-linking recommended)

## src/components/playground/OutfitBuilder.tsx

src/components/playground/OutfitBuilder.tsx:89 - `outline-none` on `<select>`; ensure a visible focus style exists

## src/components/nav/LuxoraNav.tsx

src/components/nav/LuxoraNav.tsx:167 - overlay uses `<div onClick>` (non-semantic interactive element; add button semantics + keyboard handling)

## src/app/cart/page.tsx

src/app/cart/page.tsx:75 - destructive action “Clear” happens immediately (confirmation or undo recommended)

## src/components/cart/CartLineItem.tsx

src/components/cart/CartLineItem.tsx:35 - destructive action “Remove” happens immediately (confirmation or undo recommended)

## src/app/layout.tsx

src/app/layout.tsx:49 - missing skip link before main content (recommended for keyboard/screen reader users)

## Proposed Changes (Polish + A11y)

### 1) Replace `transition: all` with explicit properties

* Update [globals.css](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/globals.css)

  * Change `.glass-btn` to transition only what’s needed (e.g. `background-color`, `border-color`, `box-shadow`, `transform`).

### 2) Add a skip link + make focus affordance robust

* Update [layout.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/layout.tsx)

  * Add a visually-hidden “Skip to content” link at the top of `<body>` targeting the main container.

  * Add an `id` to `<main>` (e.g. `id="main"`).

* Update [globals.css](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/globals.css)

  * Add styles for the skip link (hidden until focus).

  * Add `color-scheme` support for dark/light (to improve native controls).

### 3) Fix membership email form accessibility

* Update [src/app/page.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/page.tsx)

  * Add an accessible label (either a `<label className="sr-only">` or `aria-label`).

  * Add `name="email"`, `autoComplete="email"`, `spellCheck={false}`.

  * Replace `focus:outline-none focus:ring-0` with a visible focus style consistent with the Luxora focus tokens (or rely on global `:focus-visible` without suppressing it).

### 4) Fix non-semantic interactive overlay in mobile drawer

* Update [LuxoraNav](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/components/nav/LuxoraNav.tsx)

  * Replace the click-catcher overlay `<div>` with a `<button type="button">` spanning the viewport, with `aria-label="Close navigation menu"`.

  * Ensure it is keyboard reachable when the drawer is open, and supports Enter/Space.

  * Add `overscroll-behavior: contain` and consider body scroll lock while drawer is open.

### 5) Destructive actions: add confirmation or undo

* Update [cart page](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/cart/page.tsx) and [CartLineItem](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/components/cart/CartLineItem.tsx)

  * Add a lightweight confirmation flow for “Clear” and “Remove”.

  * Preferred minimal implementation: `window.confirm(...)` for demo safety (no extra UI system needed).

### 6) Ensure form controls have visible focus styles (selects)

* Update [CatalogPage](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/catalog/page.tsx) and [OutfitBuilder](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/components/playground/OutfitBuilder.tsx)

  * Remove `outline-none`, or add `focus-visible` styles that are clearly visible (consistent with Luxora focus design).

  * Ensure native `<select>` has explicit `background-color` + `color` in both themes to avoid unreadable Windows defaults.

## Assumptions & Decisions (Locked)

* Cart remains session-only; refresh clears it.

* Theme remains persisted via localStorage (`luxora-theme`).

* No new “AI Stylist” or backend scope in this phase; only polish + guideline compliance.

## Verification Steps

* Run `pnpm lint` and `pnpm build`.

* Manual accessibility pass (keyboard-only):

  * Tab from top: skip link appears and lands on main content.

  * Nav drawer: open/close works via keyboard; focus stays usable; Escape behavior (optional).

  * Forms: membership email input announces label; focus visible.

  * Catalog: select is readable in dark/light; focus visible.

  * Cart: clear/remove confirmation prevents accidental loss.

* Reduced motion check:

  * Cursor FX disabled when `prefers-reduced-motion: reduce`.

