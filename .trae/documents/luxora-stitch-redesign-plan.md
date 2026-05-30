# Plan: Apply Stitch Luxora Light Design To App

## Summary
- Goal: restyle the current Next.js Luxora app to match the user-provided Stitch designs in `stitch_luxora_outfit_studio/` while keeping existing functionality (catalog → cart/wardrobe → playground WebM export) and keeping theme persistence (light/dark).
- Source of truth (design handoff):
  - Tokens/spec: [DESIGN.md](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/stitch_luxora_outfit_studio/stitch_luxora_outfit_studio/luxora_light/DESIGN.md)
  - Home: [luxora_haute_ai_fashion_light/screen.png](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/stitch_luxora_outfit_studio/stitch_luxora_outfit_studio/luxora_haute_ai_fashion_light/screen.png)
  - Catalog (Collections): [the_collection_luxora_light/screen.png](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/stitch_luxora_outfit_studio/stitch_luxora_outfit_studio/the_collection_luxora_light/screen.png)
  - Cart/Checkout: [your_wardrobe_checkout_light/screen.png](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/stitch_luxora_outfit_studio/stitch_luxora_outfit_studio/your_wardrobe_checkout_light/screen.png)
  - Playground (Studio): [outfit_studio_playround_redesign/screen.png](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/stitch_luxora_outfit_studio/stitch_luxora_outfit_studio/outfit_studio_playround_redesign/screen.png)
  - Ideas: [ideas_video_gallery_with_details/screen.png](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/stitch_luxora_outfit_studio/stitch_luxora_outfit_studio/ideas_video_gallery_with_details/screen.png)
- Decisions confirmed:
  - Theme: keep both light + dark; persist user choice (current `localStorage` behavior).
  - Navigation: add pages for the extra nav items (Ideas, Atelier, Editorial) so links work.

## Current State Analysis
- Framework: Next.js App Router (Next `16.2.6`) + React `19` ([package.json](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/package.json)).
- Existing pages:
  - Home [src/app/page.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/page.tsx)
  - Catalog [src/app/catalog/page.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/catalog/page.tsx)
  - Cart [src/app/cart/page.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/cart/page.tsx)
  - Playground [src/app/playground/page.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/playground/page.tsx)
- Shared UI:
  - Nav [LuxoraNav.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/components/nav/LuxoraNav.tsx)
  - Cursor FX [LuxoraCursor.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/components/fx/LuxoraCursor.tsx)
  - Product card [ProductCard.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/components/product/ProductCard.tsx)
  - Cart line [CartLineItem.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/components/cart/CartLineItem.tsx)
  - Playground components [src/components/playground](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/components/playground)
- State + data:
  - Theme persistence via `data-theme` + localStorage: [ThemeProvider.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/lib/theme/ThemeProvider.tsx)
  - Cart provider (session-only): [CartProvider.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/lib/cart/CartProvider.tsx)
  - Local product catalog: [products.ts](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/lib/products.ts)
- Styling:
  - Global tokens + glass utilities are in [globals.css](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/globals.css), currently optimized for a dark, gold-glow aesthetic.

## Implementation Approach (How We’ll Apply The Stitch Design)
- Translate the Stitch HTML prototypes into the existing React pages/components (no iframe embedding).
- Use `globals.css` as the single source for design tokens:
  - Implement the Luxora Light tokens from `DESIGN.md`.
  - Retain a Luxora Dark theme, but restyle it so it “belongs” to the same system (same typography scale and component shapes; darker palette + adapted glass treatment).
- Keep the current functional flows intact:
  - `/catalog`: filters + add-to-wardrobe works.
  - `/cart`: quantity edits + totals work (cart remains session-only).
  - `/playground`: outfit selection + WebM recording works.

## Proposed Changes (Files + What/Why/How)

### 1) Design tokens + typography (Light-first mapping + Dark harmonization)
- Update [globals.css](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/globals.css)
  - Replace current token set with a new token set aligned to `Luxora Light`:
    - Colors: `--surface-*`, `--outline-*`, `--primary-*`, `--secondary-*`, etc (mirroring `DESIGN.md`).
    - Text: `--text-primary`, `--text-secondary` mapped to `on-surface` and `on-surface-variant`.
    - Glass: redefine `.glass-card/.glass-elevated/.glass-btn` to match Stitch’s “glass-panel” look in light mode (subtle border + soft shadow + blur).
  - Dark theme:
    - Keep `[data-theme="dark"]` (or `:root`) as dark tokens, but adjust radii/shadows/typography to match the same component language as light.
  - Ensure `color-scheme` tracks theme (`html { color-scheme: ... }`).
- Update [layout.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/layout.tsx)
  - Switch display font to `Libre Caslon Text` to match Stitch typography (keep Geist + Space Mono).
  - Ensure font variables map cleanly to `--font-display / --font-ui / --font-mono`.

### 2) Navigation (match Stitch layout + add new routes)
- Update [LuxoraNav.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/components/nav/LuxoraNav.tsx)
  - Desktop: left nav links, centered logotype, right icon actions (search/bag/user).
  - Mobile: menu icon, centered logotype, bag icon; slide-out drawer for nav items.
  - Map Stitch nav to routes:
    - Collections → `/catalog`
    - Studio → `/playground`
    - Ideas → `/ideas`
    - Atelier → `/atelier`
    - Editorial → `/editorial`
    - Bag icon → `/cart`
  - Theme toggle:
    - Keep the toggle, but restyle it to match Stitch (e.g., a subtle text button in the drawer + optional icon action on desktop).
  - Accessibility:
    - Ensure icon-only buttons have `aria-label`.
    - Ensure the drawer overlay and close affordances are keyboard reachable.

### 3) Footer (shared)
- Add `src/components/nav/LuxoraFooter.tsx`
  - Implement the stitched footer layout (brand block + 2–3 link columns + newsletter input).
  - Reuse across all pages via [layout.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/layout.tsx).

### 4) Home page (match luxora_haute_ai_fashion_light)
- Update [src/app/page.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/page.tsx)
  - Re-layout to match the screenshot structure:
    - Full hero with serif headline and dual CTAs.
    - Four feature tiles (glass cards).
    - “Enter the Atelier” teaser section linking to Studio/Playground.
    - Editorial quote banner.
  - Keep existing product highlight section only if it fits the stitched layout; otherwise move it to a lower “Collections Preview” section.

### 5) Catalog page (match the_collection_luxora_light)
- Update [src/app/catalog/page.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/catalog/page.tsx)
  - Desktop layout:
    - Sticky left filter sidebar in a glass panel (categories + search + refine controls).
    - Main product grid on the right.
  - Mobile layout:
    - Top title + “tune” filter button (opens a drawer/sheet).
  - Keep current filter logic but restyle UI to match screenshot:
    - Categories align with existing categories.
    - Tag/refine controls map to existing tags (visual chips).
    - “Load more” button can remain cosmetic (or implement pagination later).

### 6) Product card restyle (match stitched card/hover)
- Update [ProductCard.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/components/product/ProductCard.tsx)
  - Match stitched proportions and hover behavior:
    - Aspect ratio 3/4 image, subtle zoom on hover.
    - Overlay gradient + quick add button appears on hover.
  - Ensure keyboard access:
    - Quick add is a `<button>`, not only hover-dependent (visible on focus-within).

### 7) Cart page restyle (match your_wardrobe_checkout_light, keep cart functionality)
- Update [src/app/cart/page.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/cart/page.tsx)
  - Layout: two-column checkout canvas:
    - Left: “Shipping Information” form is visual-only (optional), plus “Your Selection” list (real cart items).
    - Right: order summary panel (real totals from cart).
  - CTA:
    - Replace “Continue to Payment” with an app-appropriate action (e.g., “Generate Mockup” → `/playground`) while keeping stitched layout.
- Update [CartLineItem.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/components/cart/CartLineItem.tsx) and [QtyStepper.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/components/cart/QtyStepper.tsx)
  - Restyle line item layout (thumbnail, title, meta, inline qty pill, remove icon).

### 8) Playground page restyle (match outfit_studio_playround_redesign)
- Update [src/app/playground/page.tsx](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/app/playground/page.tsx)
  - Structure:
    - Left: large preview “stage” card (reuse/upgrade [OutfitStage](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/components/playground/OutfitStage.tsx)).
    - Right: “Your Fit” control panel (reuse/upgrade [OutfitBuilder](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/components/playground/OutfitBuilder.tsx)).
    - Recording/export section integrated into the page layout (reuse [VideoRecorder](file:///c:/Users/Gilbert/Documents/GitHub/TRAE-hackaton/luxora/src/components/playground/VideoRecorder.tsx)).
  - Keep existing outfit selection + WebM export behavior.

### 9) Add new pages: Ideas / Atelier / Editorial
- Add:
  - `src/app/ideas/page.tsx`
    - Implement a video gallery UI matching the Ideas screenshot (cards with play overlay, duration badge, tags).
    - Use static data + image thumbnails (can be generated via the existing `text_to_image` endpoint) to avoid adding a backend.
  - `src/app/atelier/page.tsx`
    - Minimal but styled: editorial hero + grid of “atelier notes” or “materials” cards.
  - `src/app/editorial/page.tsx`
    - Minimal but styled: editorial index (issue cards) using the same component language.

## Web Interface Guidelines Compliance (Post-change audit)
- After implementing the redesign, run a sweep focused on:
  - Icon-only controls: `aria-label`.
  - Form labels: real labels for newsletter + any shipping inputs (even if decorative).
  - Avoid `transition: all`.
  - Focus-visible states for hover-dependent controls (quick add, drawer).
- Files to audit:
  - `src/app/**/*.{ts,tsx}`
  - `src/components/**/*.{ts,tsx}`
  - `src/app/globals.css`

## Assumptions & Decisions (Locked)
- Keep theme persistence via localStorage (existing `ThemeProvider` behavior).
- Cart remains session-only (no persistence added).
- Ideas/Atelier/Editorial pages are frontend-only (static content, no API).

## Verification Steps
- Run:
  - `pnpm lint`
  - `pnpm build`
- Manual UX checks:
  - Theme toggle switches between light/dark without unreadable text or broken glass effects.
  - Nav: all links route correctly; drawer works on mobile; icon buttons have hover/focus.
  - Catalog: filters still work; “Add to Wardrobe” works; quick add works via keyboard focus.
  - Cart: quantity edits update totals; remove/clear still works.
  - Playground: selection works; recording exports `.webm`.
  - Ideas/Atelier/Editorial: pages render and match the stitched aesthetic.

