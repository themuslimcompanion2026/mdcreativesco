import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, MessageCircle, Send, Sparkles, Phone } from "lucide-react";
import { SectionHeading } from "../components/ui-premium/SectionHeading";
import { GlassCard } from "../components/ui-premium/GlassCard";
import { AuroraBackground } from "../components/fx/AuroraBackground";
import { useBookingSettings } from "@/hooks/useSiteData";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a Call — MD Creatives" },
      { name: "description", content: "Schedule a 30-minute strategy call with MD Creatives. Map your project, audience, and conversion goals." },
      { property: "og:title", content: "Book a Strategy Call — MD Creatives" },
      { property: "og:description", content: "30 minutes that can transform your digital presence." },
    ],
  }),
  component: BookPage,
});

function BookPage() {
  const { data: settings } = useBookingSettings();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [project, setProject] = useState("");
  const [budget, setBudget] = useState("");
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const wa = settings?.whatsapp_number?.replace(/[^0-9]/g, "");
  const tg = settings?.telegram_url;
  const cal = settings?.calendly_url;

  const budgetOptions = ["Under $2k", "$2k–$5k", "$5k–$10k", "$10k+"];

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (wa) {
      const msg = encodeURIComponent(
        `Hi MD Creatives, I'm ${name} (${email}${phone ? `, ${phone}` : ""}). Project: ${project}. Budget: ${budget}.`
      );
      window.open(`https://wa.me/${wa}?text=${msg}`, "_blank");
    }
    setSubmitted(true);
  };

  return (
    <section className="relative overflow-hidden pt-36 pb-24 md:pt-44 md:pb-32">
      <AuroraBackground className="opacity-60" />
      <div aria-hidden className="absolute inset-0 bg-grid opacity-[0.2]" />

      <div className="relative mx-auto max-w-6xl px-4 md:px-8">
        <SectionHeading
          eyebrow="Strategy Call"
          title={<>{settings?.heading ?? "Book a Strategy Call"}</>}
          description={settings?.subheading ?? "30 minutes to map your project, audience, and conversion goals."}
        />

        <div className="mt-14 grid gap-6 md:grid-cols-[1.2fr_1fr]">
          {/* Form */}
          <GlassCard className="p-7 md:p-9">
            {submitted ? (
              <div className="py-12 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl glass" style={{ boxShadow: "var(--shadow-glow)" }}>
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-5 text-xl font-bold">Request Received</h3>
                <p className="mt-2 text-sm text-muted-foreground">We'll reach out within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <h3 className="text-lg font-semibold">Tell us about your project</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="rounded-xl glass px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="rounded-xl glass px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/70" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone / WhatsApp (optional)"
                    className="w-full rounded-xl glass pl-10 pr-20 py-3 text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Optional
                  </span>
                </div>

                {/* Premium custom Budget dropdown — matches futuristic glass UI */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setBudgetOpen((o) => !o)}
                    onBlur={() => setTimeout(() => setBudgetOpen(false), 120)}
                    className="flex w-full items-center justify-between rounded-xl glass px-4 py-3 text-sm outline-none transition-colors hover:bg-white/[0.06]"
                  >
                    <span className={budget ? "text-foreground" : "text-muted-foreground"}>
                      {budget || "Budget range"}
                    </span>
                    <svg className={`h-4 w-4 text-muted-foreground transition-transform ${budgetOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="none">
                      <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {budgetOpen && (
                    <div
                      className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-background/80 p-1 shadow-[var(--shadow-glow)] backdrop-blur-xl"
                    >
                      {budgetOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setBudget(opt);
                            setBudgetOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-white/[0.07] ${
                            budget === opt ? "bg-white/[0.06] text-foreground" : "text-foreground/85"
                          }`}
                        >
                          <span>{opt}</span>
                          {budget === opt && <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_oklch(0.7_0.22_255_/_0.6)]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <textarea
                  required
                  rows={5}
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  placeholder="Project goals, timeline, audience..."
                  className="w-full resize-none rounded-xl glass px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.01]"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Send className="h-4 w-4" />
                  {settings?.cta_primary_label ?? "Send Request"}
                </button>
              </form>
            )}
          </GlassCard>


          {/* Right: Calendar + Quick Contact */}
          <div className="space-y-6">
            {cal && (
              <GlassCard className="overflow-hidden p-0">
                <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  Pick a Time
                </div>
                <iframe
                  src={cal}
                  title="Schedule a call"
                  className="h-[560px] w-full"
                  loading="lazy"
                />
              </GlassCard>
            )}

            <GlassCard className="p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Quick contact</div>
              <div className="mt-4 space-y-2.5">
                {wa && (
                  <a
                    href={`https://wa.me/${wa}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl bg-[oklch(0.65_0.18_150_/_0.12)] px-4 py-3 text-sm font-medium ring-1 ring-[oklch(0.65_0.18_150_/_0.3)] transition-all hover:bg-[oklch(0.65_0.18_150_/_0.2)]"
                  >
                    <span className="flex items-center gap-2.5">
                      <MessageCircle className="h-4 w-4 text-[oklch(0.75_0.2_150)]" />
                      WhatsApp
                    </span>
                    <span className="text-xs text-muted-foreground">Chat now →</span>
                  </a>
                )}
                {tg && (
                  <a
                    href={tg}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl bg-[oklch(0.7_0.18_240_/_0.12)] px-4 py-3 text-sm font-medium ring-1 ring-[oklch(0.7_0.18_240_/_0.3)] transition-all hover:bg-[oklch(0.7_0.18_240_/_0.2)]"
                  >
                    <span className="flex items-center gap-2.5">
                      <Send className="h-4 w-4 text-[oklch(0.78_0.18_240)]" />
                      Telegram
                    </span>
                    <span className="text-xs text-muted-foreground">Open →</span>
                  </a>
                )}
                {!wa && !tg && (
                  <p className="text-sm text-muted-foreground">Use the form to reach us. We respond within 24h.</p>
                )}
              </div>
            </GlassCard>

            {settings?.details_md && (
              <GlassCard className="p-6">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">What you get</div>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/85">{settings.details_md}</p>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
