import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Download, CheckCircle2, Clock, XCircle, ShieldCheck, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui-premium/GlassCard";
import { useInvoice, useQrCodes } from "@/hooks/usePayments";
import { submitInvoiceVerification } from "@/lib/payments.functions";

export const Route = createFileRoute("/invoice/$id")({
  head: () => ({ meta: [{ title: "Invoice — MD Creatives" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: InvoicePage,
});

const fmt = (n: number, ccy: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: ccy, maximumFractionDigits: 2 }).format(n);

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { Icon: any; cls: string; label: string }> = {
    paid: { Icon: CheckCircle2, cls: "bg-green-500/15 text-green-300 border-green-400/30", label: "Paid" },
    pending: { Icon: Clock, cls: "bg-amber-500/15 text-amber-300 border-amber-400/30", label: "Pending" },
    failed: { Icon: XCircle, cls: "bg-red-500/15 text-red-300 border-red-400/30", label: "Failed" },
    cancelled: { Icon: XCircle, cls: "bg-white/5 text-muted-foreground border-white/15", label: "Cancelled" },
  };
  const m = map[status] ?? map.pending;
  const I = m.Icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${m.cls}`}>
      <I className="h-3.5 w-3.5" /> {m.label}
    </span>
  );
}

function InvoicePage() {
  const { id } = Route.useParams();
  const { data: inv, isLoading } = useInvoice(id);
  const { data: qrCodes = [] } = useQrCodes({ activeOnly: true });

  if (isLoading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  if (!inv) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Invoice not found.</div>;

  const matchedQr = qrCodes.find((q: any) => q.plan_id === inv.plan_id) ?? qrCodes[0];

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Invoice</div>
            <h1 className="mt-1 text-3xl font-bold text-gradient">{inv.invoice_number}</h1>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={inv.status} />
            <a
              href={`/api/public/invoices/${inv.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Download className="h-4 w-4" /> Download PDF
            </a>
          </div>
        </div>

        <GlassCard className="mt-8 p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Bill To</div>
              <div className="mt-2 text-lg font-bold">{inv.client_name}</div>
              {inv.client_company && <div className="text-sm text-muted-foreground">{inv.client_company}</div>}
              {inv.client_website && <div className="text-sm text-muted-foreground">{inv.client_website}</div>}
              {inv.client_email && <div className="text-sm text-muted-foreground">{inv.client_email}</div>}
            </div>
            <div className="md:text-right">
              <div className="grid grid-cols-2 gap-y-1.5 text-sm">
                <span className="text-muted-foreground">Issue Date</span><span>{inv.issue_date}</span>
                <span className="text-muted-foreground">Due Date</span><span>{inv.due_date}</span>
                <span className="text-muted-foreground">Method</span><span className="capitalize">{inv.payment_method ?? "—"}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-xl border border-white/10">
            <div className="grid grid-cols-12 bg-white/5 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <div className="col-span-8">Description</div>
              <div className="col-span-4 text-right">Amount (USD)</div>
            </div>
            <div className="grid grid-cols-12 px-4 py-4">
              <div className="col-span-8">
                <div className="font-semibold">{inv.plan_name}</div>
                {inv.notes && <div className="mt-1 text-xs text-muted-foreground whitespace-pre-line">{inv.notes}</div>}
              </div>
              <div className="col-span-4 text-right font-semibold">{fmt(Number(inv.usd_amount), "USD")}</div>
            </div>
          </div>

          <div className="mt-6 ml-auto w-full max-w-sm space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal (USD)</span><span>{fmt(Number(inv.usd_amount), "USD")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Exchange Rate</span><span>1 USD = {Number(inv.fx_rate).toFixed(4)} {inv.client_currency}</span></div>
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">FX Source</span><span className="text-muted-foreground">{inv.fx_source}</span></div>
            <div className="border-t border-white/10 pt-3 flex justify-between text-base font-bold">
              <span>Total ({inv.client_currency})</span>
              <span className="text-gradient">{fmt(Number(inv.converted_amount), inv.client_currency)}</span>
            </div>
          </div>

          {inv.status !== "paid" && matchedQr && (inv.payment_method === "qr" || !inv.payment_method) && (
            <div className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-6">
              <div className="text-sm font-semibold">Pay via QR</div>
              <p className="mt-1 text-xs text-muted-foreground">Scan the QR code with your preferred banking app to complete payment.</p>
              <div className="mt-4 flex items-center gap-4">
                <img src={matchedQr.image_url} alt={matchedQr.label} className="h-44 w-44 rounded-lg bg-white p-2 object-contain" />
                <div className="text-xs text-muted-foreground">
                  <div className="font-semibold text-foreground">{matchedQr.label}</div>
                  <div className="mt-1">Currency: {matchedQr.currency}</div>
                </div>
              </div>
            </div>
          )}

          {inv.status !== "paid" && (inv.payment_method === "qr" || !inv.payment_method) && (
            <VerificationBlock invoice={inv} />
          )}

          {inv.status !== "paid" && (inv.payment_method === "wise" || inv.payment_method === "card") && (
            <div className="mt-8 rounded-xl border border-blue-400/30 bg-blue-500/5 p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-200">
                <ShieldCheck className="h-4 w-4" /> Auto-verified payment
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Your {inv.payment_method === "wise" ? "Wise transfer" : "card payment"} will be confirmed automatically once the
                payment provider notifies us. No further action is needed — this page will update to <strong>Paid</strong>.
              </p>
            </div>
          )}

          {inv.status === "paid" && (
            <div className="mt-8 rounded-xl border border-green-400/30 bg-green-500/10 p-6">
              <div className="flex items-center gap-2 text-green-300 font-semibold"><CheckCircle2 className="h-5 w-5" /> Payment Confirmed</div>
              <div className="mt-2 text-xs text-muted-foreground">
                Method: {inv.payment_method ?? "—"} · Paid {inv.paid_at ? new Date(inv.paid_at).toLocaleString() : ""}
                {inv.wise_reference ? ` · Ref ${inv.wise_reference}` : ""}
              </div>
            </div>
          )}
        </GlassCard>

        <p className="mt-6 text-center text-xs text-muted-foreground">Generated by MD Creatives · Thank you for your business.</p>
      </div>
    </div>
  );
}

function VerificationBlock({ invoice }: { invoice: any }) {
  const submit = useServerFn(submitInvoiceVerification);
  const qc = useQueryClient();
  const [reference, setReference] = useState(invoice.verification_reference ?? "");
  const [proofUrl, setProofUrl] = useState(invoice.verification_proof_url ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(invoice.verification_status === "pending_review");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!reference.trim() && !proofUrl.trim()) {
      setErr("Enter the transaction reference or paste a proof URL.");
      return;
    }
    setBusy(true);
    try {
      await submit({
        data: {
          invoice_id: invoice.id,
          reference: reference.trim() || null,
          proof_url: proofUrl.trim() || null,
        },
      });
      setDone(true);
      qc.invalidateQueries({ queryKey: ["invoice", invoice.id] });
    } catch (e: any) {
      setErr(e?.message ?? "Could not submit verification. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="mt-6 rounded-xl border border-amber-400/30 bg-amber-500/10 p-6">
        <div className="flex items-center gap-2 text-amber-200 font-semibold">
          <Clock className="h-4 w-4" /> Pending Verification
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Thanks — we received your payment proof. Our team will review and confirm your invoice within 1 business day.
          You'll be able to download the official receipt once verified.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
      <div className="text-sm font-semibold flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-primary" /> Confirm your QR payment
      </div>
      <p className="text-xs text-muted-foreground">
        For your protection, QR payments require quick verification. Enter the bank/transaction reference number from
        your payment receipt — or paste a link to your proof screenshot.
      </p>
      <input
        value={reference}
        onChange={(e) => setReference(e.target.value)}
        placeholder="Transaction reference / receipt number"
        className="w-full rounded-xl glass px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40"
      />
      <input
        value={proofUrl}
        onChange={(e) => setProofUrl(e.target.value)}
        placeholder="(Optional) Public link to proof screenshot"
        className="w-full rounded-xl glass px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40"
      />
      {err && <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{err}</div>}
      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-60"
        style={{ background: "var(--gradient-primary)" }}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
        {busy ? "Submitting…" : "Submit for Verification"}
      </button>
    </form>
  );
}
