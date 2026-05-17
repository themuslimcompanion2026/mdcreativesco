import { ArrowRight, Sparkles, Code2, BarChart3, Activity } from "lucide-react";
import { MagneticButton } from "../ui-premium/MagneticButton";
import { AuroraBackground } from "../fx/AuroraBackground";
import { ParticleField } from "../fx/ParticleField";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-24 md:pt-44 md:pb-32">
      <AuroraBackground />
      <div aria-hidden className="absolute inset-0 bg-grid opacity-[0.35]" />
      <div aria-hidden className="absolute inset-0 bg-radial-fade" />
      <ParticleField density={50} />

      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Premium Digital Experience Studio
          </div>

          <h1 className="mt-7 text-balance text-5xl font-bold leading-[1.02] tracking-tight md:text-7xl lg:text-[7.5rem]">
            <span className="text-gradient">MD Creatives</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-balance text-xl font-medium text-foreground/90 md:text-2xl">
            Websites that don't just look beautiful —{" "}
            <span className="text-gradient-primary">they convert.</span>
          </p>

          <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            We build premium websites designed to increase trust, attract customers, and turn visitors into paying clients.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <MagneticButton href="/contact">
              Start Your Project <ArrowRight className="h-4 w-4" />
            </MagneticButton>
            <MagneticButton href="/portfolio" variant="ghost">
              View Portfolio
            </MagneticButton>
          </div>
        </div>

        {/* Floating dashboard mockup */}
        <div className="relative mx-auto mt-20 max-w-5xl">
          <div
            aria-hidden
            className="absolute -inset-10 -z-10 rounded-[3rem] opacity-60"
            style={{ background: "var(--gradient-glow)", filter: "blur(40px)" }}
          />
          <div
            className="relative rounded-2xl glass p-2 shadow-[var(--shadow-elevated)] animate-float-slow"
            style={{ transform: "perspective(1400px) rotateX(8deg)" }}
          >
            <div className="rounded-xl bg-surface-2/60 p-5 md:p-7">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <div className="ml-3 h-5 flex-1 rounded-md bg-white/5" />
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <DashCard icon={<BarChart3 className="h-4 w-4" />} label="Conversion" value="+312%" />
                <DashCard icon={<Activity className="h-4 w-4" />} label="Page Speed" value="98 / 100" />
                <DashCard icon={<Sparkles className="h-4 w-4" />} label="Engagement" value="4.8x" />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-[1.6fr_1fr]">
                <div className="h-44 overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br from-surface to-background p-4">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Revenue Velocity</div>
                  <svg viewBox="0 0 400 120" className="mt-2 h-32 w-full">
                    <defs>
                      <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.7 0.22 255)" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="oklch(0.7 0.22 255)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,90 C60,80 90,40 140,50 C200,62 240,20 300,30 C340,36 380,20 400,15 L400,120 L0,120 Z" fill="url(#g1)" />
                    <path d="M0,90 C60,80 90,40 140,50 C200,62 240,20 300,30 C340,36 380,20 400,15" fill="none" stroke="oklch(0.7 0.22 255)" strokeWidth="2" />
                  </svg>
                </div>
                <div className="rounded-xl border border-white/5 bg-background/60 p-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
                  <div className="text-foreground/80">{"<Conversion />"}</div>
                  <div><span className="text-primary">const</span> trust = <span className="text-accent">build</span>();</div>
                  <div><span className="text-primary">const</span> design = <span className="text-accent">cinematic</span>;</div>
                  <div><span className="text-primary">return</span> &lt;Premium /&gt;;</div>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-primary">
                    <Code2 className="h-3 w-3" /> shipping
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating ornaments */}
          <div className="pointer-events-none absolute -left-8 top-12 hidden md:block">
            <div className="rounded-2xl glass px-4 py-3 shadow-[var(--shadow-card)] animate-float">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Trust Score</div>
              <div className="text-lg font-semibold text-gradient">98%</div>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-6 bottom-10 hidden md:block">
            <div className="rounded-2xl glass px-4 py-3 shadow-[var(--shadow-card)] animate-float" style={{ animationDelay: "-3s" }}>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">LCP</div>
              <div className="text-lg font-semibold text-gradient">0.9s</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-background/60 p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/15 text-primary">{icon}</span>
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-gradient">{value}</div>
    </div>
  );
}
