import * as Icons from "lucide-react";
import { Sparkles } from "lucide-react";
import { GlassCard } from "../ui-premium/GlassCard";
import { AnimatedCounter } from "../ui-premium/AnimatedCounter";
import { RevealOnScroll } from "../fx/RevealOnScroll";
import { useStatsItems } from "@/hooks/useSiteData";

export function TrustStats() {
  const { data: stats = [] } = useStatsItems();
  if (!stats.length) return null;

  return (
    <section className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <RevealOnScroll className="mb-12 text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Trusted Worldwide
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-6">
          {stats.map((s, i) => {
            const Icon = ((Icons as any)[s.icon] as React.ComponentType<{ className?: string }>) ?? Sparkles;
            return (
              <RevealOnScroll key={s.id} delay={i * 80}>
                <GlassCard className="p-6 text-center">
                  <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary shadow-[0_0_20px_oklch(0.7_0.22_255_/_0.25)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-4 text-3xl font-bold tracking-tight text-gradient md:text-4xl">
                    <AnimatedCounter to={Number(s.value) || 0} prefix={s.prefix ?? ""} suffix={s.suffix ?? ""} />
                  </div>
                  <div className="mt-1.5 text-xs leading-snug text-muted-foreground md:text-sm">{s.label}</div>
                </GlassCard>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
