import { Brain, Layout, Palette, Smartphone, Zap, Sparkles } from "lucide-react";
import { GlassCard } from "../ui-premium/GlassCard";
import { SectionHeading } from "../ui-premium/SectionHeading";
import { RevealOnScroll } from "../fx/RevealOnScroll";

const pillars = [
  { icon: Brain, title: "Psychology-driven design", desc: "Layouts that guide attention and trigger action." },
  { icon: Layout, title: "Strategic structure", desc: "Every section engineered for conversion." },
  { icon: Palette, title: "Branding expertise", desc: "Visual identity that signals premium." },
  { icon: Smartphone, title: "Mobile-first", desc: "Flawless experience on every device." },
  { icon: Zap, title: "Speed obsessed", desc: "Sub-second loads. Buttery interactions." },
  { icon: Sparkles, title: "High-end aesthetics", desc: "Luxury polish in every pixel." },
];

export function About() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-14 md:grid-cols-2 md:items-center">
          <RevealOnScroll>
            <div>
              <SectionHeading
                eyebrow="About"
                align="left"
                title={<>A studio built for brands that refuse to look ordinary.</>}
                description="MD Creatives is a conversion-focused web development brand crafting premium digital experiences for ambitious businesses. We blend psychology, strategy, branding, and engineering to build sites that don't just impress — they perform."
              />
              <div className="mt-8 flex flex-wrap gap-3">
                {["Conversion-focused", "Premium UI/UX", "Mobile-first", "SEO-ready"].map((t) => (
                  <span key={t} className="rounded-full glass px-4 py-1.5 text-xs text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={120}>
            <GlassCard className="p-6 md:p-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {pillars.map((p) => (
                  <div key={p.title} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                      <p.icon className="h-4 w-4" />
                    </div>
                    <div className="mt-3 text-sm font-semibold">{p.title}</div>
                    <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.desc}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
