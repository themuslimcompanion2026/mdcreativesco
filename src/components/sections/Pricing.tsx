import { Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import { GlassCard } from "../ui-premium/GlassCard";
import { SectionHeading } from "../ui-premium/SectionHeading";
import { usePricingPlans, usePricingSettings } from "@/hooks/useSiteData";

const currencySymbol: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", AED: "AED ", SAR: "SAR ", PHP: "₱",
};

function MaintenanceDescription({ text }: { text?: string | null }) {
  if (!text || !text.trim()) return null;
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) {
    return (
      <ul className="mt-1.5 space-y-1">
        {lines.map((l, i) => (
          <li key={i} className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground/90">
            <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-primary/70" />
            <span>{l}</span>
          </li>
        ))}
      </ul>
    );
  }
  return <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground/90">{lines[0]}</p>;
}

export function Pricing() {
  const { data: settings } = usePricingSettings();
  const { data: plans = [] } = usePricingPlans();

  if (settings && settings.visible === false) return null;
  if (!plans.length) return null;

  return (
    <section id="pricing" className="relative overflow-hidden py-24 md:py-32">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-[0.2]" />
      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          eyebrow="Investment"
          title={<>{settings?.heading ?? "Premium Tiers"}</>}
          description={settings?.subheading ?? "Predictable pricing. Premium delivery."}
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const features = Array.isArray(plan.features) ? (plan.features as string[]) : [];
            const sym = currencySymbol[plan.currency] ?? `${plan.currency} `;
            return (
              <GlassCard
                key={plan.id}
                className={`p-7 ${plan.featured ? "ring-1 ring-primary/40" : ""}`}
                intensity={plan.featured ? 10 : 6}
              >
                {plan.featured && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-40"
                    style={{ background: "radial-gradient(500px circle at 50% 0%, oklch(0.7 0.22 255 / 0.25), transparent 60%)" }}
                  />
                )}
                {plan.badge && (
                  <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                    <Sparkles className="h-3 w-3" />
                    {plan.badge}
                  </div>
                )}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                {plan.description && (
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>
                )}
                <div className="mt-6 min-h-[3.5rem]">
                  {plan.show_price === false ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold tracking-tight text-gradient">Custom</span>
                      <span className="text-xs text-muted-foreground">tailored quote</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-bold tracking-tight text-gradient">
                        {sym}
                        {Number(plan.price).toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">{plan.billing_label}</span>
                    </div>
                  )}

                  {plan.show_price !== false && (plan.monthly_maintenance_price != null || plan.yearly_maintenance_price != null) && (
                    <div className="mt-3 space-y-3 border-l-2 border-primary/30 pl-3">
                      {plan.monthly_maintenance_price != null && (
                        <div>
                          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Optional · Monthly Maintenance
                          </div>
                          <p className="text-xs text-muted-foreground">
                            <span className="text-primary">+</span>{" "}
                            <span className="font-semibold text-foreground/90">
                              {(currencySymbol[plan.monthly_maintenance_currency ?? plan.currency] ?? `${plan.monthly_maintenance_currency ?? plan.currency} `)}
                              {Number(plan.monthly_maintenance_price).toLocaleString()}
                            </span>
                            /month
                          </p>
                          <MaintenanceDescription text={plan.monthly_maintenance_description} />
                        </div>
                      )}
                      {plan.yearly_maintenance_price != null && (
                        <div>
                          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            Optional · Long-Term Partnership
                          </div>
                          <p className="text-xs text-muted-foreground">
                            <span className="text-primary">+</span>{" "}
                            <span className="font-semibold text-foreground/90">
                              {(currencySymbol[plan.yearly_maintenance_currency ?? plan.currency] ?? `${plan.yearly_maintenance_currency ?? plan.currency} `)}
                              {Number(plan.yearly_maintenance_price).toLocaleString()}
                            </span>
                            /year
                          </p>
                          <MaintenanceDescription text={plan.yearly_maintenance_description} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <ul className="mt-6 space-y-2.5">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-foreground/85">{f}</span>
                    </li>
                  ))}
                </ul>
                {plan.note && <p className="mt-4 text-xs italic text-muted-foreground">{plan.note}</p>}
                <Link
                  to={(plan.show_price === false ? (plan.hidden_price_cta_url || "/book") : (plan.cta_url || "/contact"))}
                  className={`mt-7 flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition-transform hover:scale-[1.02] ${
                    plan.featured || plan.show_price === false
                      ? "text-primary-foreground shadow-[var(--shadow-glow)]"
                      : "border border-white/15 bg-white/5 text-foreground hover:bg-white/10"
                  }`}
                  style={(plan.featured || plan.show_price === false) ? { background: "var(--gradient-primary)" } : undefined}
                >
                  {plan.show_price === false ? (plan.hidden_price_cta_label || "Get Custom Quote") : plan.cta_label}
                </Link>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
