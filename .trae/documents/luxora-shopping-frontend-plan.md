# Plan: Luxora Shopping Frontend (Home / Catalog / Cart / Playground)

## Summary
Build a fully working, theme-driven Luxora shopping frontend with four routes:
- Home: Luxora editorial hero + feature strips per `luxora-design.md`
- Catalog: product grid, filters, “Add to Wardrobe”
- Cart: editable wardrobe (quantity/remove), order summary UI
- Playground: assemble an outfit from wardrobe items and generate a downloadable animated video mockup (`.webm`)

Theme must follow [luxora-design.md](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/luxora-design.md) (Liquid Glass, void/forest/gold palette, editorial typography) and include a light mode toggle (requested).

## Current State Analysis
- Framework: Next.js App Router (Next `16.2.6`) with React `19.2.4` ([package.json](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/package.json)).
- Existing pages: only starter [layout.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/layout.tsx) and [page.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/page.tsx).
- Styling: Tailwind v4 via [globals.css](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/globals.css) and PostCSS ([postcss.config.mjs](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/postcss.config.mjs)).
- No existing component library, state store, or product data.
- `node_modules/next/dist/docs/` is not present in the workspace right now, so Next’s local docs can only be consulted after dependencies are installed.

## Assumptions & Decisions (Locked)
- Product source: curated sample product set stored locally in code (no backend).
- Cart persistence: session-only (in-memory React state). Refresh clears it.
- Video mockup: downloadable `.webm` generated client-side using Canvas + `MediaRecorder`, ~6–8 seconds.
- Theme: dark Luxora theme + a light mode variant with a user toggle (stored in `localStorage` to persist theme choice).
- Images: use the required `text_to_image` endpoint URLs for all product imagery; update Next config to allow that remote domain for `next/image`.

## Proposed Changes (Files + What/Why/How)

### 1) App structure & routing (4 pages)
- Update [src/app/page.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/page.tsx)
  - Replace starter content with Luxora Home page: hero (editorial headline), feature strip, “New Arrivals” highlights, and CTA to Catalog/Playground.
  - Implement Luxora motion principles (staggered reveals, subtle ambient loops) with CSS keyframes (no extra animation libs).

- Add:
  - `src/app/catalog/page.tsx`
    - Product grid per “Collections Grid” spec; tag + category filters; sort; “Quick add” hover overlay.
  - `src/app/cart/page.tsx`
    - Wardrobe/cart list with quantity controls, remove, empty-state microcopy (“Your wardrobe awaits.”).
  - `src/app/playground/page.tsx`
    - Outfit slot builder + stage + record/download `.webm`.

### 2) Shared layout, navigation, cursor, and theming
- Update [src/app/layout.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/layout.tsx)
  - Replace metadata with Luxora title/description.
  - Load fonts via `next/font/google`:
    - Cormorant Garamond (display), Geist (UI), Space Mono (accent)
  - Wrap the app with:
    - `ThemeProvider` (dark/light toggle)
    - `CartProvider` (session-only cart state)
  - Add a sticky “liquid glass” navbar present on all pages, matching the `luxora-design.md` nav spec.
  - Add an optional custom cursor glow layer that follows pointer movement (respect `prefers-reduced-motion`).

- Update [src/app/globals.css](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/globals.css)
  - Implement Luxora CSS variables exactly (void/forest/canopy/moss, gold spectrum, glass tokens, text tokens).
  - Add a light theme block (e.g. `[data-theme="light"]`) with coherent inversions:
    - warm light background, deep-green text, gold accents preserved
    - glass surfaces become light frosted with subtle gold borders
  - Add reusable utility classes (no comments) for:
    - `.glass-card`, `.glass-elevated`, `.glass-btn`
    - noise/mesh background layer
    - focus-visible ring matching Luxora spec

- Add shared UI components:
  - `src/components/nav/LuxoraNav.tsx`
    - Active underline, cart count, theme toggle, responsive drawer for mobile.
  - `src/components/fx/LuxoraCursor.tsx`
    - Gold dot/ring cursor enhancement; disabled on touch and with reduced motion.
  - `src/components/ui/Glass.tsx`
    - Small wrappers (`GlassCard`, `GlassButton`) to reduce repeated class soup while staying Tailwind-first.

### 3) Product data & cart state
- Add:
  - `src/lib/products.ts`
    - ~12 curated products with: id, name, price, category (top/bottom/outerwear/shoes/accessory), tags, and image URL.
    - Image URLs generated using:
      - `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=...&image_size=portrait_4_3`
  - `src/lib/types.ts`
    - TypeScript types for Product, CartItem, Outfit (slots), etc.
  - `src/lib/cart/CartProvider.tsx`
    - `useCart()` hook with actions: add, remove, setQty, clear.
  - `src/components/product/ProductCard.tsx`
    - Luxora card layout: image, name (display font), price, quick-add overlay.
  - `src/components/cart/CartLineItem.tsx` + `src/components/cart/QtyStepper.tsx`
    - Accessible quantity control with keyboard support.

### 4) Playground outfit builder + `.webm` export
- Add:
  - `src/lib/outfit/outfitSlots.ts`
    - Slot definitions and category→slot mapping.
  - `src/components/playground/OutfitBuilder.tsx`
    - Select items from wardrobe into slots; clear slot; auto-suggest based on category.
  - `src/components/playground/OutfitStage.tsx`
    - Visual “hologram mannequin” stage using layered DOM + SVG motifs (circuit strokes) and optional canvas grain.
  - `src/components/playground/VideoRecorder.tsx`
    - Canvas renderer that composes:
      - Luxora background (void → forest gradient + subtle gold particles)
      - mannequin outline
      - selected item images (parallax float)
    - Uses `canvas.captureStream()` + `MediaRecorder` to record for a fixed duration, then exposes a download button for the `.webm` blob.
    - Handles error states (unsupported browser) with Luxora microcopy.

### 5) Next image remote configuration
- Update [next.config.ts](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/next.config.ts)
  - Allow `next/image` to load from `https://coresg-normal.trae.ai/...` via `images.remotePatterns`.

## Verification Steps
- Install dependencies (needed to access Next local docs and run the dev server).
- Run typecheck/build:
  - `pnpm build`
- Run lint:
  - `pnpm lint`
- Manual UX checks in browser:
  - Nav works on all routes, active link underline, mobile drawer.
  - Catalog filter/sort works; add/remove updates cart count.
  - Cart quantity changes update totals; empty state renders.
  - Playground:
    - Can assign items to slots
    - Record produces a downloadable `.webm` and plays back correctly
    - Graceful fallback when `MediaRecorder` is unavailable
- Guidelines audit:
  - Fetch latest Web Interface Guidelines and review `src/app/**/*` + `src/components/**/*` for accessibility and UX issues; fix violations before final.

