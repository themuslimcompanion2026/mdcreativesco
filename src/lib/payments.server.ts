// Server-only payments helpers: Wise API client, FX, PDF generation, invoice numbering.
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const WISE_BASE = "https://api.wise.com";

export type FxResult = { rate: number; source: string };

export async function fetchFxRate(from: string, to: string): Promise<FxResult> {
  if (from === to) return { rate: 1, source: "identity" };
  // Primary: exchangerate.host
  try {
    const r = await fetch(`https://api.exchangerate.host/convert?from=${from}&to=${to}`);
    if (r.ok) {
      const j: any = await r.json();
      const rate = Number(j?.info?.rate ?? j?.result);
      if (Number.isFinite(rate) && rate > 0) return { rate, source: "exchangerate.host" };
    }
  } catch (e) {
    console.warn("[fx] exchangerate.host failed", e);
  }
  // Fallback: Wise quote (if creds present)
  try {
    const wiseRate = await wiseGetRate(from, to);
    if (wiseRate) return { rate: wiseRate, source: "wise" };
  } catch (e) {
    console.warn("[fx] wise fallback failed", e);
  }
  // Final fallback: 1:1
  return { rate: 1, source: "fallback" };
}

async function wiseAuth(): Promise<{ token: string; profileId: string } | null> {
  const token = process.env.WISE_API_TOKEN;
  const profileId = process.env.WISE_PROFILE_ID;
  if (!token || !profileId) return null;
  return { token, profileId };
}

async function wiseGetRate(from: string, to: string): Promise<number | null> {
  const a = await wiseAuth();
  if (!a) return null;
  const r = await fetch(`${WISE_BASE}/v1/rates?source=${from}&target=${to}`, {
    headers: { Authorization: `Bearer ${a.token}` },
  });
  if (!r.ok) return null;
  const arr: any = await r.json();
  return Number(arr?.[0]?.rate) || null;
}

export async function wiseCreateQuote(opts: {
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: number;
}): Promise<any | null> {
  const a = await wiseAuth();
  if (!a) return null;
  const r = await fetch(`${WISE_BASE}/v3/profiles/${a.profileId}/quotes`, {
    method: "POST",
    headers: { Authorization: `Bearer ${a.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      sourceCurrency: opts.sourceCurrency,
      targetCurrency: opts.targetCurrency,
      sourceAmount: opts.sourceAmount,
      payOut: "BANK_TRANSFER",
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    console.error("[wise] quote failed", r.status, t);
    return null;
  }
  return r.json();
}

export async function generateInvoiceNumber(): Promise<string> {
  const yr = new Date().getFullYear();
  const { count } = await supabaseAdmin
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .gte("created_at", `${yr}-01-01`);
  const n = String((count ?? 0) + 1).padStart(4, "0");
  return `INV-${yr}-${n}`;
}

/* ------------------------- PDF generation ------------------------- */

const fmt = (n: number, ccy: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: ccy, maximumFractionDigits: 2 }).format(n);

export async function buildInvoicePdf(invoice: any, brandName = "MD Creatives"): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]); // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.08, 0.09, 0.13);
  const muted = rgb(0.45, 0.47, 0.55);
  const accent = rgb(0.31, 0.45, 0.95);

  const draw = (t: string, x: number, y: number, opts: { size?: number; b?: boolean; color?: any } = {}) =>
    page.drawText(t, { x, y, size: opts.size ?? 10, font: opts.b ? bold : font, color: opts.color ?? ink });

  // Header bar
  page.drawRectangle({ x: 0, y: 792, width: 595, height: 50, color: rgb(0.05, 0.06, 0.1) });
  draw(brandName, 40, 810, { size: 18, b: true, color: rgb(1, 1, 1) });
  draw("INVOICE", 480, 810, { size: 14, b: true, color: rgb(1, 1, 1) });

  // Meta
  let y = 760;
  draw("Invoice #", 40, y, { color: muted, size: 9 });
  draw(invoice.invoice_number, 40, y - 14, { b: true, size: 12 });
  draw("Issue Date", 220, y, { color: muted, size: 9 });
  draw(String(invoice.issue_date), 220, y - 14, { size: 11 });
  draw("Due Date", 360, y, { color: muted, size: 9 });
  draw(String(invoice.due_date), 360, y - 14, { size: 11 });
  draw("Status", 480, y, { color: muted, size: 9 });
  draw(invoice.status.toUpperCase(), 480, y - 14, { b: true, size: 11, color: invoice.status === "paid" ? rgb(0.1, 0.6, 0.3) : accent });

  // Bill to
  y = 700;
  draw("BILL TO", 40, y, { color: muted, size: 9, b: true });
  draw(invoice.client_name, 40, y - 16, { b: true, size: 12 });
  let by = y - 32;
  if (invoice.client_company) { draw(invoice.client_company, 40, by, { size: 10 }); by -= 14; }
  if (invoice.client_website) { draw(invoice.client_website, 40, by, { size: 10, color: muted }); by -= 14; }
  if (invoice.client_email) { draw(invoice.client_email, 40, by, { size: 10, color: muted }); by -= 14; }

  // Line item
  y = 600;
  page.drawRectangle({ x: 40, y: y - 6, width: 515, height: 28, color: rgb(0.95, 0.96, 0.99) });
  draw("DESCRIPTION", 50, y + 4, { color: muted, size: 9, b: true });
  draw("AMOUNT (USD)", 460, y + 4, { color: muted, size: 9, b: true });
  draw(invoice.plan_name, 50, y - 24, { b: true, size: 12 });
  draw(fmt(Number(invoice.usd_amount), "USD"), 460, y - 24, { b: true, size: 12 });

  // Totals + FX block
  y = 520;
  draw("Subtotal (USD)", 360, y, { color: muted, size: 10 });
  draw(fmt(Number(invoice.usd_amount), "USD"), 480, y, { size: 10 });
  y -= 16;
  draw("Exchange Rate", 360, y, { color: muted, size: 10 });
  draw(`1 USD = ${Number(invoice.fx_rate).toFixed(4)} ${invoice.client_currency}`, 460, y, { size: 10 });
  y -= 16;
  draw(`FX Source`, 360, y, { color: muted, size: 9 });
  draw(invoice.fx_source, 460, y, { size: 9, color: muted });
  y -= 24;
  page.drawLine({ start: { x: 360, y: y + 8 }, end: { x: 555, y: y + 8 }, thickness: 0.5, color: muted });
  draw(`Total (${invoice.client_currency})`, 360, y - 6, { b: true, size: 12 });
  draw(fmt(Number(invoice.converted_amount), invoice.client_currency), 460, y - 6, { b: true, size: 12, color: accent });

  // Payment confirmation block
  if (invoice.status === "paid") {
    y = 420;
    page.drawRectangle({ x: 40, y: y - 50, width: 515, height: 60, color: rgb(0.92, 0.98, 0.94), borderColor: rgb(0.3, 0.7, 0.45), borderWidth: 1 });
    draw("PAYMENT CONFIRMED", 56, y - 8, { b: true, size: 12, color: rgb(0.1, 0.5, 0.25) });
    draw(`Method: ${invoice.payment_method ?? "—"}`, 56, y - 24, { size: 10 });
    if (invoice.wise_reference) draw(`Wise Ref: ${invoice.wise_reference}`, 56, y - 38, { size: 10 });
    if (invoice.paid_at) draw(`Paid: ${new Date(invoice.paid_at).toUTCString()}`, 280, y - 24, { size: 10 });
  }

  // Footer
  draw(`Generated by ${brandName} · Thank you for your business.`, 40, 50, { size: 9, color: muted });

  return pdf.save();
}
