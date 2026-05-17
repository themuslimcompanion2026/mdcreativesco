import { ArrowUpRight, ExternalLink } from "lucide-react";
import { SectionHeading } from "../ui-premium/SectionHeading";
import { RevealOnScroll } from "../fx/RevealOnScroll";

const projects = [
  { title: "Aurora Travel Co.", category: "Travel · Booking", gradient: "linear-gradient(135deg, oklch(0.55 0.22 255), oklch(0.45 0.27 305))" },
  { title: "Vault Commerce", category: "E-commerce · Luxury", gradient: "linear-gradient(135deg, oklch(0.4 0.2 280), oklch(0.55 0.25 220))" },
  { title: "Nova AI Studio", category: "SaaS · AI", gradient: "linear-gradient(135deg, oklch(0.5 0.27 305), oklch(0.6 0.22 255))" },
  { title: "Atelier Maison", category: "Brand · Portfolio", gradient: "linear-gradient(135deg, oklch(0.45 0.18 240), oklch(0.55 0.22 200))" },
  { title: "Pulse Booking", category: "Booking · SaaS", gradient: "linear-gradient(135deg, oklch(0.5 0.25 280), oklch(0.45 0.27 320))" },
  { title: "Lumen Agency", category: "Agency · Marketing", gradient: "linear-gradient(135deg, oklch(0.55 0.22 255), oklch(0.5 0.18 220))" },
];

export function Portfolio() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Selected Work"
            align="left"
            title={<>Premium projects, real results.</>}
            description="A curated showcase of websites engineered to convert, designed to impress, and built to scale."
          />
          <a
            href="/portfolio"
            className="inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm transition-colors hover:bg-white/10"
          >
            View all <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {projects.map((p, i) => (
            <RevealOnScroll key={p.title} delay={(i % 2) * 100}>
              <ProjectCard {...p} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ title, category, gradient }: { title: string; category: string; gradient: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl glass p-6 transition-all duration-500 hover:shadow-[var(--shadow-elevated)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{category}</div>
          <h3 className="mt-1 text-2xl font-semibold">{title}</h3>
        </div>
        <a
          href="#"
          aria-label="Live preview"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full glass transition-all hover:shadow-[var(--shadow-glow)]"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {/* MacBook mockup */}
      <div className="relative mt-7">
        <div
          className="relative mx-auto aspect-[16/10] w-full overflow-hidden rounded-xl border border-white/10 transition-transform duration-700 group-hover:scale-[1.02]"
          style={{ background: gradient }}
        >
          <div aria-hidden className="absolute inset-0 bg-grid opacity-30 mix-blend-overlay" />
          <div className="absolute inset-x-6 top-6 flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white/40" />
            <span className="h-2 w-2 rounded-full bg-white/40" />
            <span className="h-2 w-2 rounded-full bg-white/40" />
          </div>
          <div className="absolute inset-x-6 top-12 space-y-2">
            <div className="h-3 w-24 rounded bg-white/30" />
            <div className="h-2 w-40 rounded bg-white/20" />
          </div>
          <div className="absolute inset-x-6 bottom-6 grid grid-cols-3 gap-2">
            <div className="h-12 rounded-md bg-white/15" />
            <div className="h-12 rounded-md bg-white/25" />
            <div className="h-12 rounded-md bg-white/15" />
          </div>
          <div
            aria-hidden
            className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: "radial-gradient(400px circle at center, oklch(1 0 0 / 0.15), transparent 60%)" }}
          />
        </div>
        {/* Stand */}
        <div className="mx-auto mt-1 h-1.5 w-2/3 rounded-b-xl bg-white/10" />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px -z-10 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: gradient, filter: "blur(40px)" }}
      />
    </div>
  );
}
