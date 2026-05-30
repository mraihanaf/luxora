---
name: Luxora Light
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#424844'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#737873'
  outline-variant: '#c2c8c2'
  surface-tint: '#306948'
  primary: '#000401'
  on-primary: '#ffffff'
  primary-container: '#002311'
  on-primary-container: '#58916c'
  inverse-primary: '#98d4ab'
  secondary: '#755a26'
  on-secondary: '#ffffff'
  secondary-container: '#fdd798'
  on-secondary-container: '#785c29'
  tertiary: '#020201'
  on-tertiary: '#ffffff'
  tertiary-container: '#1d1d19'
  on-tertiary-container: '#86857f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b3f1c6'
  primary-fixed-dim: '#98d4ab'
  on-primary-fixed: '#002110'
  on-primary-fixed-variant: '#155131'
  secondary-fixed: '#ffdea8'
  secondary-fixed-dim: '#e6c183'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5b4311'
  tertiary-fixed: '#e5e2db'
  tertiary-fixed-dim: '#c9c6c0'
  on-tertiary-fixed: '#1c1c18'
  on-tertiary-fixed-variant: '#474742'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Libre Caslon Text
    fontSize: 64px
    fontWeight: '400'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Libre Caslon Text
    fontSize: 40px
    fontWeight: '400'
    lineHeight: 48px
  headline-lg-mobile:
    fontFamily: Libre Caslon Text
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
  headline-md:
    fontFamily: Libre Caslon Text
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 36px
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

This design system embodies a premium editorial aesthetic, blending the intellectual rigor of high-end publishing with the crisp efficiency of modern technology. The brand personality is sophisticated, authoritative, and tranquil. It targets a discerning audience that values clarity and understated luxury.

The style is a refined evolution of **Minimalism** infused with **Liquid Glass** accents. By transitioning to a light theme, the focus shifts from luminous glows to tactile depth and precise contrast. Surfaces are primarily white, utilizing subtle, layered shadows to establish hierarchy. The interaction of traditional serif typography with technical sans-serif faces creates a "New Heritage" feel—modern tools built on classical foundations.

## Colors

The palette is anchored by **Forest Green (#104D2E)**, used as the primary accent to signify stability and prestige. This is supported by a **Champagne Gold (#C5A368)** secondary color for high-value interactions and a **Soft Bone (#F4F1EA)** tertiary tone for large surface areas and containers.

- **Primary:** Forest Green. Used for primary actions, headings, and critical brand moments.
- **Secondary:** Muted Gold. Used for accents, highlights, and specialized "Premium" states.
- **Background:** Absolute White (#FFFFFF) to provide a canvas for the "Liquid Glass" materials.
- **Text:** The primary text is rendered in a deep off-black (#1A1A1A) to maintain high legibility while avoiding the harshness of pure black.

## Typography

The typographic system utilizes a "High-Low" pairing. **Libre Caslon Text** (serving as the editorial alternative to Cormorant) is used for all display and headline roles, providing a literary, authoritative voice. **Geist** is used for body copy, labels, and UI elements to ensure technical precision and readability.

Headlines should favor tight letter-spacing and generous line-height to maintain an editorial rhythm. Body text is set with generous leading to prevent visual fatigue on white backgrounds. Labels are always set in Geist with increased letter-spacing and uppercase casing to distinguish them from narrative content.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for desktop to emulate the structured columns of a premium magazine, while transitioning to a **Fluid Grid** for mobile. 

- **Desktop:** 12-column grid, max-width 1440px, with 64px outside margins.
- **Tablet:** 8-column grid with 32px margins.
- **Mobile:** 4-column grid with 16px margins.

Spacing is intentional and expansive. We use whitespace as a functional element to separate "chapters" of content. Gutters are kept at a consistent 24px to ensure breathing room between technical UI components and serif-heavy content blocks.

## Elevation & Depth

In the light theme, "Liquid Glass" is expressed through **subtle refraction and soft shadows** rather than inner glows. 

- **Lowest Level (Base):** Pure white background.
- **Mid Level (Cards/Sheets):** White surfaces with a 1px border in #E5E7EB. These use a multi-layered shadow: a soft, 15% opacity ambient occlusion and a sharper 5% opacity directional shadow.
- **High Level (Modals/Popovers):** Features a "Frosted Glass" effect (Backdrop Blur: 20px) with a semi-transparent white fill (rgba(255, 255, 255, 0.8)). 

The goal is to make elements feel as though they are machined glass or high-quality paper floating slightly above a pristine surface. Shadows should never appear "muddy"—use a hint of the primary Forest Green in the shadow's hex value to maintain color harmony.

## Shapes

The shape language is "Rounded," transitioning away from strict architectural sharpness to a more fluid, modern feel. This rounding adds a layer of approachability to the sophisticated brand voice.

- **Small elements (Checkboxes, Inputs):** 8px (0.5rem) radius.
- **Medium elements (Buttons, Cards):** 16px (1rem) radius.
- **Large elements (Modals, Featured Sections):** 24px (1.5rem) radius.

This generous rounding creates a distinctive silhouette for components, reinforcing the "Liquid" aspect of the Liquid Glass style while maintaining a clean, professional appearance.

## Components

### Buttons
- **Primary:** Solid Forest Green (#104D2E) with White text. Rounded (16px). No shadow on rest; subtle lift on hover.
- **Secondary:** Ghost style. 1px border of #104D2E with Forest Green text.
- **Tertiary:** Text-only in Forest Green with a hairline underline appearing on hover.

### Input Fields
- **Default:** White background with a 1px border (#E5E7EB) and 8px corner radius.
- **Focus:** Border transitions to Forest Green with a 2px soft "glow" shadow using the primary color at 10% opacity.

### Chips/Tags
- **Informational:** Soft Bone (#F4F1EA) background with Forest Green text. High roundedness (pill-shaped).
- **Actionable:** White background with 1px border, transitioning to solid Forest Green on select.

### Cards
- Cards utilize the "Liquid Glass" depth. They feature a 1px #E5E7EB border, a 16px corner radius, and a very soft shadow (0px 4px 20px rgba(16, 77, 46, 0.05)). Content inside cards should be padded at the 'md' spacing unit (24px).

### Navigation
- Top navigation bars should use the backdrop-blur effect (20px) with a 1px bottom border in #E5E7EB to maintain the "Liquid Glass" narrative as users scroll.