import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CreditCard, QrCode, Banknote, Sparkles, Loader2, ArrowRight, ChevronDown, Check } from "lucide-react";
import { SectionHeading } from "@/components/ui-premium/SectionHeading";
import { GlassCard } from "@/components/ui-premium/GlassCard";
import { AuroraBackground } from "@/components/fx/AuroraBackground";
import { usePricingPlans } from "@/hooks/useSiteData";
import { useQrCodes } from "@/hooks/usePayments";
import { createPublicInvoice, previewFxRate } from "@/lib/payments.functions";

export const Route = createFileRoute("/payment")({
  head: () => ({
    meta: [
      { title: "Payment — MD Creatives" },
      { name: "description", content: "Securely pay for your selected plan via Wise, QR code or card. Auto-generated invoice and instant PDF." },
      { property: "og:title", content: "Pay & Get Your Invoice — MD Creatives" },
      { property: "og:description", content: "Premium checkout with Wise integration, live FX, and instant invoice." },
    ],
  }),
  component: PaymentPage,
});

const CURRENCIES = ["USD", "EUR", "GBP", "AED", "PHP", "AUD", "CAD", "INR", "SGD", "JPY"];

type Method = "wise" | "qr" | "card";

function PaymentPage() {
  const navigate = useNavigate();
  const { data: plans = [] } = usePricingPlans();
  const { data: qrCodes = [] } = useQrCodes({ activeOnly: true });
  const create = useServerFn(createPublicInvoice);
  const fx = useServerFn(previewFxRate);

  const [client_name, setName] = useState("");
  const [client_email, setEmail] = useState("");
  const [client_website, setWebsite] = useState("");
  const [planId, setPlanId] = useState<string>("");
  const [currency, setCurrency] = useState("USD");
  const [method, setMethod] = useState<Method>("wise");
  const [planOpen, setPlanOpen] = useState(false);
  const [ccyOpen, setCcyOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState({ name: "", number: "", exp: "", cvv: "" });
  const [fxPreview, setFxPreview] = useState<{ rate: number; converted: number; source: string } | null>(null);

  const selectedPlan: any = useMemo(() => plans.find((p: any) => p.id === planId), [plans, planId]);
  const usd = Number(selectedPlan?.price ?? 0);
  const isCustomQuote = selectedPlan ? !selectedPlan.show_price : false;

  // Live FX preview
  useEffect(() => {
    let active = true;
    if (!selectedPlan || isCustomQuote || usd <= 0) { setFxPreview(null); return; }
    (async () => {
      try {
        const r = await fx({ data: { from: "USD", to: currency, amount: usd } });
        if (active) setFxPreview(r);
      } catch { /* ignore */ }
    })();
    return () => { active = false; };
  }, [usd, currency, selectedPlan, isCustomQuote, fx]);


  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!client_name.trim() || !client_email.trim() || !planId) {
      setError("Please complete all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const notes = method === "card"
        ? `Card payment requested · cardholder: ${card.name || "—"} · last4: ${card.number.replace(/\s/g, "").slice(-4) || "—"}`
        : null;
      const inv = await create({
        data: {
          plan_id: planId,
          client_name: client_name.trim(),
          client_email: client_email.trim(),
          client_website: client_website.trim() || null,
          client_currency: currency,
          payment_method: method,
          notes,
        },
      });
      navigate({ to: "/invoice/$id", params: { id: inv.id } });
    } catch (err: any) {
      setError(err?.message ?? "Could not create invoice. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative overflow-hidden pt-36 pb-24 md:pt-44 md:pb-32">
      <AuroraBackground className="opacity-60" />
      <div aria-hidden className="absolute inset-0 bg-grid opacity-[0.18]" />

      <div className="relative mx-auto max-w-6xl px-4 md:px-8">
        <SectionHeading
          eyebrow="Secure Checkout"
          title={<>Pay & Get Your <span className="text-gradient">Invoice</span></>}
          description="Choose your plan, pay via Wise · QR · Card. Your invoice is generated automatically with live FX and a downloadable PDF."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-[1.3fr_1fr]">
          <GlassCard className="p-7 md:p-9">
            <form onSubmit={onSubmit} className="space-y-5">
              <h3 className="text-lg font-semibold">Your details</h3>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  required
                  value={client_name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name or company"
                  className="rounded-xl glass px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40"
                />
                <input
                  required
                  type="email"
                  value={client_email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="rounded-xl glass px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <input
                value={client_website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="Website / domain (optional)"
                className="w-full rounded-xl glass px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40"
              />

              {/* Plan dropdown */}
              <PremiumSelect
                label="Plan"
                value={selectedPlan?.name || "Select a plan"}
                placeholder="Select a plan"
                open={planOpen}
                setOpen={setPlanOpen}
                options={plans.map((p: any) => ({
                  value: p.id,
                  label: p.name,
                  hint: p.show_price ? `$${Number(p.price).toLocaleString()} ${p.billing_label || ""}` : "Custom Quote",
                }))}
                onSelect={(v) => setPlanId(v)}
              />

              {/* Currency dropdown */}
              <PremiumSelect
                label="Currency"
                value={currency}
                placeholder="Currency"
                open={ccyOpen}
                setOpen={setCcyOpen}
                options={CURRENCIES.map((c) => ({ value: c, label: c }))}
                onSelect={(v) => setCurrency(v)}
              />

              {/* Method */}
              <div>
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Payment Method</div>
                <div className="grid grid-cols-3 gap-2">
                  <MethodPill icon={Banknote} label="Wise Transfer" active={method === "wise"} onClick={() => setMethod("wise")} />
                  <MethodPill icon={QrCode} label="QR Code" active={method === "qr"} onClick={() => setMethod("qr")} />
                  <MethodPill icon={CreditCard} label="Card" active={method === "card"} onClick={() => setMethod("card")} />
                </div>
              </div>

              {method === "card" && (
                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <input
                    value={card.name}
                    onChange={(e) => setCard({ ...card, name: e.target.value })}
                    placeholder="Cardholder name"
                    className="w-full rounded-xl glass px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40"
                  />
                  <input
                    value={card.number}
                    onChange={(e) => setCard({ ...card, number: e.target.value.replace(/[^\d ]/g, "").slice(0, 19) })}
                    placeholder="Card number"
                    inputMode="numeric"
                    className="w-full rounded-xl glass px-4 py-3 text-sm tracking-widest outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={card.exp}
                      onChange={(e) => setCard({ ...card, exp: e.target.value.replace(/[^\d/]/g, "").slice(0, 5) })}
                      placeholder="MM/YY"
                      className="rounded-xl glass px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40"
                    />
                    <input
                      value={card.cvv}
                      onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                      placeholder="CVV"
                      inputMode="numeric"
                      className="rounded-xl glass px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Card payments are processed via our Wise-powered banking layer. You'll receive secure payment instructions on your invoice page after submission.
                  </p>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.01] disabled:opacity-60"
                style={{ background: "var(--gradient-primary)" }}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {submitting ? "Generating invoice…" : "Generate Invoice & Continue"}
                {!submitting && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
              </button>
            </form>
          </GlassCard>

          {/* Summary */}
          <GlassCard className="h-fit p-7 md:p-9">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Order Summary</div>
            <div className="mt-3 text-2xl font-bold">{selectedPlan?.name ?? "Choose a plan"}</div>
            {selectedPlan?.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{selectedPlan.description}</p>
            )}
            <div className="mt-6 space-y-2 text-sm">
              <Row k="Subtotal (USD)" v={isCustomQuote ? "—" : `$${usd.toLocaleString()}`} />
              <Row k="Currency" v={currency} />
              {fxPreview && !isCustomQuote && (
                <>
                  <Row k="Exchange rate" v={`1 USD = ${fxPreview.rate.toFixed(4)} ${currency}`} />
                  <Row k="FX source" v={fxPreview.source} muted />
                </>
              )}
              <div className="my-3 h-px bg-white/10" />
              <div className="flex items-center justify-between text-base font-bold">
                <span>Total ({currency})</span>
                <span className="text-gradient">
                  {isCustomQuote ? "Quoted on request" : fxPreview ? new Intl.NumberFormat("en-US", { style: "currency", currency }).format(fxPreview.converted) : `${usd.toFixed(2)} USD`}
                </span>
              </div>
            </div>

            {method === "qr" && qrCodes.length > 0 && (
              <div className="mt-6 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Choose a payment method</div>
                {qrCodes
                  .filter((q: any) => !planId || !q.plan_id || q.plan_id === planId)
                  .map((q: any) => (
                  <div key={q.id} className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-4 transition-all hover:border-primary/40">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">{q.label}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">{q.currency}</div>
                        {q.account_name && <div className="mt-2 text-[11px]"><span className="text-muted-foreground">Name: </span><span className="text-foreground/90">{q.account_name}</span></div>}
                        {q.account_number && <div className="text-[11px] font-mono"><span className="text-muted-foreground font-sans">Account: </span>{q.account_number}</div>}
                        {q.payment_link && (
                          <a href={q.payment_link} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
                            <ArrowRight className="h-3 w-3" /> Open payment link
                          </a>
                        )}
                      </div>
                      <img src={q.image_url} alt={q.label} className="h-24 w-24 shrink-0 rounded-lg bg-white p-1.5 object-contain" />
                    </div>
                    {q.description && <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{q.description}</p>}
                  </div>
                ))}
                <p className="mt-2 text-center text-[11px] text-muted-foreground">After paying, click "Generate Invoice" to receive your receipt.</p>
              </div>
            )}
            {method === "qr" && qrCodes.length === 0 && (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center text-xs text-muted-foreground">
                No QR payment methods are configured yet. Please choose Wise or Card.
              </div>
            )}

            <div className="mt-6 flex items-center gap-2 text-[11px] text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-primary" /> Auto-generated invoice & PDF
            </div>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-primary" /> Live Wise FX snapshot
            </div>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-primary" /> Secure checkout via Wise
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}

function Row({ k, v, muted }: { k: string; v: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className={muted ? "text-muted-foreground text-xs" : ""}>{v}</span>
    </div>
  );
}

function MethodPill({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-[11px] font-semibold transition-all ${
        active
          ? "border-primary/50 bg-primary/10 text-foreground shadow-[var(--shadow-glow)]"
          : "border-white/10 bg-white/[0.02] text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function PremiumSelect({
  label, value, placeholder, options, onSelect, open, setOpen,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: { value: string; label: string; hint?: string }[];
  onSelect: (v: string) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  return (
    <div className="relative">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-xl glass px-4 py-3 text-sm outline-none transition-all hover:bg-white/[0.06] focus:ring-2 focus:ring-primary/40"
      >
        <span className={value === placeholder ? "text-muted-foreground" : ""}>{value}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#0b0d14]/95 backdrop-blur-xl shadow-2xl">
          <div className="max-h-64 overflow-y-auto py-1">
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onSelect(o.value); setOpen(false); }}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-white/[0.06]"
              >
                <span>{o.label}</span>
                {o.hint && <span className="text-xs text-muted-foreground">{o.hint}</span>}
              </button>
            ))}
            {options.length === 0 && (
              <div className="px-4 py-3 text-xs text-muted-foreground">No options available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
