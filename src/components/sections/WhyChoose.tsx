import { Check, X } from "lucide-react";
import { SectionHeading } from "../ui-premium/SectionHeading";
import { GlassCard } from "../ui-premium/GlassCard";
import { RevealOnScroll } from "../fx/RevealOnScroll";

const rows: Array<{ label: string; avg: string; md: string }> = [
  { label: "Conversion Rate", avg: "1–2%", md: "8–15%" },
  { label: "Loading Speed", avg: "5–8s", md: "<1s" },
  { label: "Design Quality", avg: "Generic templates", md: "Custom luxury UI" },
  { label: "Trust Factor", avg: "Low", md: "Premium / Elite" },
  { label: "Mobile Experience", avg: "Broken layouts", md: "Pixel-perfect" },
  { label: "Branding", avg: "Forgettable", md: "Iconic identity" },
  { label: "SEO Structure", avg: "Afterthought", md: "Built-in" },
  { label: "User Flow", avg: "Random sections", md: "Strategic journey" },
];

export function WhyChoose() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          eyebrow="Why MD Creatives"
          title={<>Average website vs. MD Creatives.</>}
          description="Most websites are built to exist. Ours are built to compete — and win."
        />

        <RevealOnScroll className="mt-14">
          <GlassCard className="overflow-hidden p-0">
            <div className="grid grid-cols-[1.2fr_1fr_1fr] border-b border-white/5 bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="p-5">Metric</div>
              <div className="p-5 text-center">Average Website</div>
              <div className="relative p-5 text-center text-foreground">
                MD Creatives
                <span
                  aria-hidden
                  className="absolute inset-0 -z-0"
                  style={{ background: "linear-gradient(180deg, oklch(0.7 0.22 255 / 0.08), transparent)" }}
                />
              </div>
            </div>
            {rows.map((r, i) => (
              <div
                key={r.label}
                className={`grid grid-cols-[1.2fr_1fr_1fr] items-center border-b border-white/5 transition-colors hover:bg-white/[0.02] ${
                  i === rows.length - 1 ? "border-b-0" : ""
                }`}
              >
                <div className="p-5 text-sm font-medium">{r.label}</div>
                <div className="flex items-center justify-center gap-2 p-5 text-sm text-muted-foreground">
                  <X className="h-4 w-4 text-destructive/80" />
                  <span>{r.avg}</span>
                </div>
                <div
                  className="relative flex items-center justify-center gap-2 p-5 text-sm font-semibold"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(90deg, transparent, oklch(0.7 0.22 255 / 0.05), transparent)" }}
                  />
                  <Check className="relative h-4 w-4 text-primary" />
                  <span className="relative text-gradient">{r.md}</span>
                </div>
              </div>
            ))}
          </GlassCard>
        </RevealOnScroll>
      </div>
    </section>
  );
}
