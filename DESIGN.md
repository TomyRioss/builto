---
name: Monolith Ultra
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#4c4546'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#4648d4'
  on-secondary: '#ffffff'
  secondary-container: '#6063ee'
  on-secondary-container: '#fffbff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1b1b'
  on-tertiary-container: '#848484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  section-gap: 80px
---

## Brand & Style

This design system is built on the principles of **High-End Minimalism**. It targets sophisticated SaaS users who value efficiency, clarity, and a "quiet" interface that recedes to let their work take center stage. The brand personality is professional and authoritative, yet technologically forward-thinking.

The visual language emphasizes:
- **Spatial Luxury:** High whitespace (macro-spacing) to reduce cognitive load and evoke a premium feel.
- **Precision:** Perfect alignment, 1px strokes, and razor-sharp typography.
- **Human-Centric Tech:** While the palette is monochromatic, the spare use of "Electric Indigo" signals intelligence and interactive potential, particularly for AI-driven features.
- **Reduced Friction:** Visual noise is eliminated by removing unnecessary decorations, gradients, and heavy shadows.

## Colors

The palette is strictly curated to maintain a high-end, editorial aesthetic. 

- **Monochromatic Core:** Pure White (#FFFFFF) and Pure Black (#000000) form the structural foundation. Black is used for primary text and high-contrast actions.
- **The Accent:** Electric Indigo (#6366F1) is the only chromatic element. It must be used with restraint—reserved for primary calls to action, active states, and AI-assisted insights. 
- **Neutral Hierarchy:** Very light grays are utilized for structural borders and background sectioning to maintain softness without losing the crispness of the design. Secondary text uses a medium gray to establish clear information hierarchy.

## Typography

The design system utilizes **Inter** for its systematic, utilitarian, yet modern character. 

- **Headings:** Use tighter letter spacing for large displays to create a "locked-in" editorial look.
- **Labels:** Small labels and overlines should use uppercase with increased letter spacing (5%) to differentiate them from body text and improve legibility at small scales.
- **Hierarchy:** Contrast is achieved through weight (Semibold vs. Regular) and scale rather than color. Maintain significant vertical rhythm between heading levels to preserve whitespace.

## Layout & Spacing

This design system uses a **12-column fluid grid** for content areas, with a fixed maximum width for desktop to prevent line lengths from becoming unreadable.

- **The 4px Rule:** All spacing increments must be multiples of 4px to ensure mathematical harmony.
- **Generous Margins:** Desktop layouts utilize a 40px outer margin to provide "breathability."
- **Sectioning:** Large vertical gaps (80px+) are encouraged between major content blocks to emphasize the minimalist, premium feel.
- **Reflow:** On mobile devices, columns stack vertically, and horizontal margins shrink to 16px to maximize screen real estate while maintaining the 24px gutter between stacked elements.

## Elevation & Depth

In keeping with the minimalist philosophy, depth is conveyed through **Tonal Layers** and **Low-contrast Outlines** rather than heavy shadows.

- **Borders as Dividers:** Use 1px solid borders in `#F3F4F6` for most structural divisions.
- **Surface Tiers:** Use `#F9FAFB` for background surfaces and `#FFFFFF` for elevated cards or containers. This "white-on-gray" approach provides subtle depth.
- **Shadows:** Use only one type of shadow—an extremely diffused "Ambient Shadow" for floating elements (like dropdowns or modals). 
  - *Shadow Spec:* `0 10px 30px -5px rgba(0, 0, 0, 0.04)`.
- **Active State:** The Electric Indigo accent provides "functional depth," highlighting the active path or focused element without needing physical elevation.

## Shapes

The shape language is **Soft (0.25rem)**, leaning toward a precise, architectural feel.

- **Base Radius:** Buttons, input fields, and small components use a 4px (0.25rem) radius.
- **Large Components:** Cards and modals use a "rounded-lg" (8px/0.5rem) radius to feel approachable but remain crisp.
- **Avoidance:** Do not use fully rounded (pill-shaped) elements unless they are status tags or badges, as they often conflict with the system's professional, structured aesthetic.

## Components

- **Buttons:** 
  - *Primary:* Solid Black background, White text. No border.
  - *Secondary:* White background, Black text, 1px border (#000000).
  - *Accent:* Electric Indigo background, White text (reserved for AI or key "Magic" actions).
- **Input Fields:** 1px border (#F3F4F6). On focus, the border transitions to Black or Electric Indigo with no outer glow.
- **Chips/Badges:** Small, uppercase text. Neutral chips use a light gray background; "Active" or "AI" chips use a very pale Indigo tint (#EEF2FF) with Indigo text.
- **Cards:** White background with a subtle 1px border (#F3F4F6). No shadow by default; use the Ambient Shadow only on hover to indicate interactivity.
- **Lists:** Clean rows separated by 1px horizontal lines. High vertical padding (16px+) per row to maintain the premium whitespace standard.
- **AI Status:** Indicated by a subtle pulse animation or small icon in Electric Indigo.