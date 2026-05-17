import { Compass, Target, PenTool, Code2, Gauge, Rocket } from "lucide-react";
import { SectionHeading } from "../ui-premium/SectionHeading";
import { GlassCard } from "../ui-premium/GlassCard";
import { RevealOnScroll } from "../fx/RevealOnScroll";

const steps = [
  { icon: Compass, title: "Discovery", desc: "We dive deep into your brand, audience, and goals to align on vision." },
  { icon: Target, title: "Strategy", desc: "Conversion architecture, narrative, and structure mapped end-to-end." },
  { icon: PenTool, title: "Design", desc: "Cinematic, on-brand UI crafted with luxury detail and motion." },
  { icon: Code2, title: "Development", desc: "Engineered with modern tech, blazing performance, and clean code." },
  { icon: Gauge, title: "Optimization", desc: "Speed, SEO, accessibility, and analytics tuned to perfection." },
  { icon: Rocket, title: "Launch", desc: "Go live with confidence — and ongoing support to keep growing." },
];

export function Process() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          eyebrow="Process"
          title={<>A premium 6-step journey.</>}
          description="Every project is engineered through a refined process designed for clarity, quality, and results."
        />

        <div className="relative mt-16">
          <div
            aria-hidden
            className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 md:block"
            style={{ background: "linear-gradient(180deg, transparent, oklch(0.7 0.22 255 / 0.4), oklch(0.65 0.27 305 / 0.4), transparent)" }}
          />
          <ol className="space-y-6 md:space-y-10">
            {steps.map((s, i) => {
              const left = i % 2 === 0;
              return (
                <RevealOnScroll key={s.title} as="li" delay={i * 60}>
                  <div className={`relative grid items-center gap-6 md:grid-cols-2 ${left ? "" : "md:[direction:rtl]"}`}>
                    <div className={`md:[direction:ltr] ${left ? "md:pr-12" : "md:pl-12"}`}>
                      <GlassCard className="p-6">
                        <div className="flex items-center gap-4">
                          <div
                            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-primary-foreground shadow-[var(--shadow-glow)]"
                            style={{ background: "var(--gradient-primary)" }}
                          >
                            <s.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                              Step {String(i + 1).padStart(2, "0")}
                            </div>
                            <div className="text-xl font-semibold">{s.title}</div>
                          </div>
                        </div>
                        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                      </GlassCard>
                    </div>
                    <div aria-hidden className="hidden md:block" />
                    <div
                      aria-hidden
                      className="absolute left-1/2 top-1/2 hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full md:block"
                      style={{ background: "var(--gradient-primary)", boxShadow: "0 0 18px oklch(0.7 0.22 255 / 0.7)" }}
                    />
                  </div>
                </RevealOnScroll>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
