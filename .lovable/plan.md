## MD Creatives — Premium Portfolio Site

A dark-luxury, cinematic, conversion-focused portfolio for "MD Creatives" built with TanStack Start + Tailwind v4. Multi-route structure, premium motion, and a cohesive design system tuned to feel award-winning.

### Design System (src/styles.css)
Dark-first luxury palette in oklch:
- `--background` matte black, `--surface` deep navy, `--foreground` soft white
- `--primary` electric blue, `--accent` neon purple
- Gradients: `--gradient-hero` (navy → electric blue → neon purple), `--gradient-metallic`, `--gradient-glow`
- Shadows: `--shadow-glow`, `--shadow-elevated`, `--shadow-card`
- Glass tokens: `--glass-bg`, `--glass-border`
- Custom keyframes: `aurora`, `float`, `shimmer`, `pulse-glow`, `marquee`, `gradient-shift`, `reveal-up`
- Utilities: `.glass`, `.glow`, `.text-gradient`, `.magnetic`, `.cursor-glow-target`

### Routes (TanStack file-based)
- `/` — Home (all 10 sections in order, single landing experience)
- `/portfolio` — Expanded case studies grid
- `/services` — Detailed services
- `/about` — About MD Creatives
- `/contact` — Contact form + details

Each route has unique `head()` metadata (title, description, og:title, og:description). Shared `Header` (glass nav, magnetic links) and `Footer` rendered in `__root.tsx`.

### Shared Premium Components (`src/components/`)
- `CursorGlow` — mouse-follow radial light (fixed, pointer-events-none)
- `ParticleField` — lightweight canvas particle background
- `AuroraBackground` — animated gradient blobs with blur
- `GlassCard` — glassmorphism + 3D tilt on hover (mouse-tracked rotateX/Y)
- `MagneticButton` — button that subtly follows cursor
- `AnimatedCounter` — IntersectionObserver-driven count up
- `RevealOnScroll` — fade/translate reveal wrapper
- `MarqueeRow` — auto-scroll testimonials
- `FloatingMockup` — MacBook + phone SVG mockups with float animation
- `SectionHeading` — large cinematic h2 with gradient underline

### Home Page Sections
1. **Hero** — Full-viewport. Aurora + particles + cursor glow. Massive gradient headline "MD Creatives", subheadline, supporting copy, two CTAs (primary glow + ghost). Floating glass dashboard mockup + code snippet card with parallax.
2. **Trust & Authority** — 5 glass stat cards with animated counters and glow borders.
3. **About** — Two-column: cinematic copy + floating 3D-tilted feature card listing pillars (psychology, strategy, branding, mobile-first, speed, aesthetics).
4. **Services** — Responsive grid of 11 GlassCards with Lucide icons, hover glow + tilt.
5. **Why Choose** — Side-by-side comparison table "Average Website vs MD Creatives" with check/cross icons and animated row reveals.
6. **Portfolio Showcase** — MacBook + phone mockups in a horizontal scroller, hover reveal overlay with "Live Preview" CTA.
7. **Testimonials** — Two marquee rows (opposite directions) of glass testimonial cards with avatar, name, role, quote.
8. **Work Process** — Vertical timeline (6 steps), gradient connector line, each step is a glass card with icon and reveal animation.
9. **Final CTA** — Full-bleed cinematic block: aurora bg, particles, huge gradient headline, magnetic CTA button.
10. **Footer** — Minimal: brand mark, nav, social icons (glow on hover), inline contact form (name, email, message), copyright.

### Motion & Interaction
- Pure CSS keyframes + small JS for cursor glow, tilt, magnetic, counters (no heavy 3D libs to keep FPS high and bundle small)
- `prefers-reduced-motion` respected
- IntersectionObserver for scroll reveals
- Smooth scroll via `scroll-behavior: smooth`

### Tech / SEO / Perf
- Tailwind v4 tokens only — no hardcoded colors in components
- Semantic HTML, single H1 per route, alt text on mockups
- Per-route meta + og tags
- Mobile-first; tested layouts at sm/md/lg/xl
- Lazy-mount heavy decorative components

### File Plan
```
src/
  styles.css                 (extend with luxury tokens + keyframes)
  routes/
    __root.tsx              (add Header/Footer, dark class on html)
    index.tsx               (Home — all 10 sections)
    portfolio.tsx
    services.tsx
    about.tsx
    contact.tsx
  components/
    layout/Header.tsx
    layout/Footer.tsx
    fx/CursorGlow.tsx
    fx/ParticleField.tsx
    fx/AuroraBackground.tsx
    fx/RevealOnScroll.tsx
    ui-premium/GlassCard.tsx
    ui-premium/MagneticButton.tsx
    ui-premium/AnimatedCounter.tsx
    ui-premium/MarqueeRow.tsx
    ui-premium/FloatingMockup.tsx
    ui-premium/SectionHeading.tsx
    sections/Hero.tsx
    sections/TrustStats.tsx
    sections/About.tsx
    sections/Services.tsx
    sections/WhyChoose.tsx
    sections/Portfolio.tsx
    sections/Testimonials.tsx
    sections/Process.tsx
    sections/FinalCTA.tsx
```

### Out of Scope (v1)
- No backend / form submission wiring (contact form is UI only; can wire to Lovable Cloud later)
- No real client logos (use placeholder brand marks)
- No WebGL/Three.js (CSS + canvas particles deliver the look at much higher FPS)

Ready to build on approval.