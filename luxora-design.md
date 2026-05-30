# Luxora — Design System & Webpage Specification

> *Where fashion meets intelligence. Where luxury breathes.*

---

## Brand Essence

**Luxora** lives at the intersection of high couture and machine intelligence. The brand believes that technology, when refined enough, becomes indistinguishable from artistry. Every pixel, every transition, every interaction should feel like it was tailored — not coded.

The name itself whispers it: *Lux* (light, luxury) + *ora* (golden hour, aura). Luxora is the golden light that AI casts on the future of fashion.

---

## Design Philosophy

**"Invisible Technology. Visible Luxury."**

Draw from three reference pillars:

| Pillar | Reference | What We Borrow |
|---|---|---|
| Restraint | Uniqlo | Generous whitespace, product-first hierarchy, editorial calm |
| Accessibility | H&M | Clear navigation, democratic layout, scannable content |
| Material Language | Apple Liquid Glass | Translucency, blur, depth, light refraction |

The result: a website that feels like walking into a high-end atelier that happens to be inside a spaceship.

---

## Visual Identity

### Color System

```css
:root {
  /* Core Palette */
  --luxora-void:       #060f09;   /* Near-black green — background depth */
  --luxora-forest:     #0d2117;   /* Deep forest — section backgrounds */
  --luxora-canopy:     #163525;   /* Mid-tone green — card surfaces */
  --luxora-moss:       #1e4a32;   /* Elevated surfaces */

  /* Gold Spectrum */
  --luxora-gold:       #c9a84c;   /* Primary gold — logo, CTAs */
  --luxora-gold-light: #e8c97a;   /* Highlight gold — hover states */
  --luxora-gold-dim:   #8a6f2e;   /* Muted gold — borders, dividers */
  --luxora-gold-glow:  rgba(201, 168, 76, 0.18); /* Ambient gold glow */

  /* Liquid Glass System */
  --glass-surface:     rgba(255, 255, 255, 0.04);
  --glass-surface-md:  rgba(255, 255, 255, 0.07);
  --glass-surface-hi:  rgba(255, 255, 255, 0.11);
  --glass-border:      rgba(201, 168, 76, 0.20);
  --glass-border-hi:   rgba(201, 168, 76, 0.45);
  --glass-blur:        blur(24px) saturate(180%);
  --glass-blur-heavy:  blur(48px) saturate(200%);

  /* Text */
  --text-primary:      #f0ede6;   /* Warm off-white */
  --text-secondary:    rgba(240, 237, 230, 0.55);
  --text-muted:        rgba(240, 237, 230, 0.30);
  --text-gold:         #c9a84c;
}
```

### Typography

```css
/* Display — Editorial authority */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');

/* UI — Clean, modern, technical */
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500&display=swap');

/* Accent — Monospaced tech detail */
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400&display=swap');

:root {
  --font-display:  'Cormorant Garamond', Georgia, serif;  /* Headlines, hero */
  --font-ui:       'Geist', sans-serif;                   /* Nav, body, labels */
  --font-mono:     'Space Mono', monospace;               /* Tags, tech details */
}
```

**Type Scale:**

| Role | Font | Size | Weight | Style |
|---|---|---|---|---|
| Hero Title | Cormorant Garamond | 96–120px | 300 | Italic |
| Section Title | Cormorant Garamond | 56–72px | 400 | Normal |
| Card Headline | Cormorant Garamond | 28–36px | 300 | Normal |
| Navigation | Geist | 13px | 400 | Tracked +0.12em |
| Body | Geist | 16px | 300 | Line-height 1.7 |
| Tag / Label | Space Mono | 11px | 400 | Uppercase, tracked |

---

## Liquid Glass Design Language

Apple's Liquid Glass is a material, not just an effect. Every glass element should feel like frosted obsidian — dark, translucent, with gold light bleeding through the edges.

### Glass Component Rules

```css
/* Base Glass Card */
.glass-card {
  background: var(--glass-surface);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: 16px;

  /* Inner light refraction — top edge catches light */
  box-shadow:
    inset 0 1px 0 rgba(201, 168, 76, 0.15),   /* top light edge */
    inset 0 -1px 0 rgba(0, 0, 0, 0.3),          /* bottom shadow */
    0 8px 32px rgba(0, 0, 0, 0.4),              /* ambient shadow */
    0 0 0 0.5px rgba(201, 168, 76, 0.08);       /* outer glow border */
}

/* Elevated Glass — for nav, modals, drawers */
.glass-elevated {
  background: var(--glass-surface-md);
  backdrop-filter: var(--glass-blur-heavy);
  border: 1px solid var(--glass-border-hi);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 24px 64px rgba(0, 0, 0, 0.6),
    0 0 120px var(--luxora-gold-glow);
}

/* Glass Button */
.glass-btn {
  background: var(--glass-surface-hi);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border-hi);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.glass-btn:hover {
  background: rgba(201, 168, 76, 0.12);
  border-color: var(--luxora-gold);
  box-shadow: 0 0 24px var(--luxora-gold-glow), inset 0 1px 0 rgba(201, 168, 76, 0.3);
  transform: translateY(-1px);
}
```

### Depth Layers (Z-axis visual hierarchy)

```
Layer 0 — Void background (--luxora-void)
Layer 1 — Ambient mesh / noise texture overlay
Layer 2 — Section backgrounds (--luxora-forest)
Layer 3 — Glass cards (glass-card)
Layer 4 — Interactive elements, product images
Layer 5 — Navigation bar (glass-elevated)
Layer 6 — Modals, drawers, overlays
Layer 7 — Cursor glow / ambient light effect
```

---

## Page Architecture

### Navigation

**Style:** Sticky liquid glass bar, 100% width, ~64px height
**Behavior:** On scroll, background opacity increases from 0% → 80%, blur intensifies

```
[ LUXORA ]                    [ Collections  AI Stylist  About ]    [ ✦ Login  Cart (0) ]
  Logo (gold)                   Center links — tracked caps            Right utilities
```

- Logo: Cormorant Garamond italic, gold, 22px
- Links: Geist 12px, uppercase, letter-spacing 0.15em, gold on hover with 300ms fade
- A thin 1px gold line appears under active link
- Mobile: Hamburger opens a full-screen glass drawer from the right

---

### Hero Section

**Concept:** The mannequin from the logo comes alive. A full-viewport dark scene with a lone fashion silhouette, draped in a gown that flows with subtle CSS animation. Circuit-line traces emanate from the figure like neural veins — fashion intelligence visualized.

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│          [ambient gold particle field — subtle]         │
│                                                         │
│   ✦  LUXORA                                             │
│                                                         │
│   The Future                                            │
│   of Fashion                         [Fashion figure    │
│   is Intelligent.                     SVG/video —       │
│                                       right 40%]        │
│   [ Explore Collection ]                                │
│   [ Meet Your AI Stylist →]                            │
│                                                         │
│   ─────────────────── scroll ───────────────────       │
└─────────────────────────────────────────────────────────┘
```

**Hero Typography:**
- "The Future / of Fashion / is Intelligent." — Cormorant Garamond italic 96px, weight 300, line-height 0.95
- Gold star (✦) floats and pulses above the L in the logo treatment

**Hero Animations:**
- On load: words stagger-reveal with `opacity: 0 → 1` + `translateY(20px → 0)`, 80ms delay between lines
- Fashion figure fades in 600ms after headline
- Circuit lines draw themselves (SVG stroke-dashoffset animation)
- Subtle gold particle field using CSS custom properties + `@keyframes`

---

### Feature Strip (Uniqlo-inspired)

A horizontal scrollable strip — 4 glass tiles, clean icon + label:

```
[ ✦ AI Styling ]   [ ⬡ Curated Drops ]   [ ◈ Tailored Fit ]   [ ⟳ Sustainable ]
  Personalized       New arrivals weekly     Body-data-driven      Carbon-neutral
  to your aura       hand-selected by AI     recommendations       logistics
```

- Glass card, 280px wide, minimal icon top, label in Space Mono 11px
- Hover: gold border intensifies, card lifts 4px, inner glow pulses

---

### Collections Grid (H&M-inspired clarity)

Inspired by H&M's clean product grid — but elevated with Luxora's material language.

**Layout:** 3-column desktop / 2-column tablet / 1-column mobile

```
┌──────────────────────────────────────────────────────┐
│  NEW ARRIVALS          ·  Season SS-26               │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │          │  │  [HERO   │  │          │           │
│  │ Product  │  │  PIECE]  │  │ Product  │           │
│  │ Image    │  │  Larger  │  │ Image    │           │
│  │          │  │  card    │  │          │           │
│  ├──────────┤  │          │  ├──────────┤           │
│  │ Name     │  ├──────────┤  │ Name     │           │
│  │ $XXX  →  │  │ Name  →  │  │ $XXX  →  │           │
│  └──────────┘  └──────────┘  └──────────┘           │
└──────────────────────────────────────────────────────┘
```

**Product Card Spec:**
- Image fills card, dark overlay on hover reveals quick-add
- Below image: product name (Cormorant 20px), price (Geist 14px), arrow CTA
- Glass overlay on hover: backdrop-filter blur, "Add to Wardrobe" in gold
- Lazy-loaded images with blur-up reveal

---

### AI Stylist Feature (Brand differentiator)

A full-width editorial section — dark forest background, asymmetric layout:

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│   ┌───────────────────┐                               │
│   │                   │   Meet Your                   │
│   │   [AI Chat UI     │   Personal                    │
│   │    glass panel]   │   Stylist                     │
│   │                   │                               │
│   │  "Show me         │   Powered by fashion          │
│   │   something for   │   intelligence trained        │
│   │   a rooftop       │   on 10 years of runway       │
│   │   evening…"       │   and real-world style.       │
│   │                   │                               │
│   └───────────────────┘   [ Try It Free → ]           │
│                                                       │
└───────────────────────────────────────────────────────┘
```

- Glass panel mimics a real AI chat interface — subtle typing animation demo
- Circuit motif appears in the background as a faint green-on-green pattern
- CTA button: solid gold background, dark text — the one filled button on the page

---

### Editorial Banner (Between sections)

A full-bleed typographic moment — no images, just words:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Technology doesn't replace style.
   It reveals it.                         ✦ LUXORA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

- Cormorant Garamond italic 64px
- Scrolls at 0.7× speed (parallax)
- Thin gold rules (1px) above and below

---

### Newsletter / Membership

Minimal. Luxurious. Uniqlo-clean:

```
        Join the Inner Circle

   Early access. AI previews. Curated drops.
   Crafted for those who see fashion differently.

        [ your@email.com        → ]
             Glass input, gold border on focus
```

---

### Footer

Dark void background. Four columns — restrained, editorial:

```
LUXORA                 Collections         Company            Follow

Est. 2026              New Arrivals        About              IG  ·  TK  ·  PT
Jakarta, ID            AI Stylist          Sustainability
                       Editorial           Careers
                       Gift Cards          Contact

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

© 2026 Luxora. All rights reserved.          Privacy · Terms · Cookie Preferences
```

---

## Motion Principles

| Moment | Animation | Duration | Easing |
|---|---|---|---|
| Page load reveal | Staggered opacity + Y | 600ms | `ease-out` |
| Hero text words | Sequential fade-up | 80ms stagger | `cubic-bezier(0.2, 0, 0, 1)` |
| Card hover lift | translateY(-4px) | 300ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Nav scroll transform | Backdrop + opacity | 200ms | `ease` |
| Circuit lines draw | SVG stroke-dashoffset | 1200ms | `ease-in-out` |
| Gold glow pulse | box-shadow scale | 2s loop | `ease-in-out` |
| Image reveal | Blur-up + opacity | 400ms | `ease-out` |
| CTA button hover | Scale 1.02 + glow | 250ms | `ease` |

**Rule:** No animation exceeds 600ms (except ambient loops). Motion serves content, never performs.

---

## Interaction States

### Focus (Accessibility)
```css
:focus-visible {
  outline: 2px solid var(--luxora-gold);
  outline-offset: 3px;
  border-radius: 4px;
}
```

### Cursor
- Custom cursor: small gold circle (12px), blends with default arrow
- On hovering links/CTAs: expands to 32px ring
- On hovering images: transforms to "VIEW" text in Space Mono

---

## Responsive Breakpoints

```css
/* Mobile first */
--bp-sm:  480px;   /* Large phones */
--bp-md:  768px;   /* Tablet */
--bp-lg:  1024px;  /* Small desktop */
--bp-xl:  1280px;  /* Standard desktop */
--bp-2xl: 1536px;  /* Wide screen */
```

**Mobile adaptations:**
- Hero: single column, image below text, font scales to 56px
- Grid: 1-column product list (H&M mobile style — full-width cards)
- Navigation: glass drawer overlay from right
- AI Stylist: stacked layout, chat panel full-width
- Glass effects: reduce blur intensity for performance

---

## Micro-copy Voice

Luxora speaks in calm authority. No exclamation marks. No urgency.

| Context | Example |
|---|---|
| Hero CTA | "Explore the Collection" / "Meet Your Stylist" |
| Product CTA | "Add to Wardrobe" |
| AI feature | "Describe your occasion" |
| Newsletter | "Join the Inner Circle" |
| Loading state | "Curating your selection…" |
| Empty cart | "Your wardrobe awaits." |
| Error | "Something interrupted us. Please try once more." |

---

## Asset Requirements

| Asset | Format | Notes |
|---|---|---|
| Logo wordmark | SVG | Gold on transparent, also reversed |
| Logo mark (LX) | SVG | Icon-only version for favicon, app icon |
| Hero fashion figure | SVG or WebM | Subtle loop animation |
| Circuit decorative | SVG | Animated stroke-dashoffset |
| Product images | WebP | Dark-styled, studio, consistent crop ratio 3:4 |
| AI chat illustration | SVG | Glass panel mockup |
| Gold particle field | CSS / Canvas | Pure code, no asset needed |

---

## Performance Targets

| Metric | Target |
|---|---|
| LCP (Largest Contentful Paint) | < 2.0s |
| CLS (Cumulative Layout Shift) | < 0.05 |
| FID / INP | < 100ms |
| Total JS bundle | < 120kb gzipped |
| Image optimization | WebP, lazy-loaded, blur-up |
| Glass effect fallback | `@supports (backdrop-filter: blur())` guard |

---

## Implementation Notes

- **Framework:** Next.js 14+ (App Router) preferred — SSR for product pages, client components for AI Stylist
- **Styling:** CSS Modules or Tailwind with custom config — no utility-class soup on hero sections
- **Glass effects:** Use `backdrop-filter` with `@supports` fallback to semi-opaque `background-color`
- **Fonts:** Self-host via `next/font` for zero layout shift
- **Animation:** CSS `@keyframes` for ambient/load; Framer Motion for scroll-triggered and gesture-driven
- **AI Stylist:** Streamed API response into glass chat component
- **Analytics:** No visible tracking pixels; Plausible or Fathom for privacy-first analytics

---

*"Luxora doesn't follow trends. It anticipates them."*

---

**Document version:** 1.0 — May 2026  
**Brand:** Luxora Fashion Intelligence  
**Prepared for:** Design & Engineering Handoff
