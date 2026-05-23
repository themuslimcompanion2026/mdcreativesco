import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { fetchFxRate, generateInvoiceNumber, wiseCreateQuote } from "./payments.server";

const CreateInvoiceInput = z.object({
  plan_id: z.string().uuid().nullable().optional(),
  plan_name: z.string().min(1).max(200),
  client_name: z.string().min(1).max(200),
  client_email: z.string().email().nullable().optional(),
  client_company: z.string().max(200).nullable().optional(),
  client_website: z.string().max(300).nullable().optional(),
  usd_amount: z.number().min(0),
  client_currency: z.string().min(3).max(8).default("USD"),
  due_days: z.number().int().min(0).max(365).default(7),
  payment_method: z.enum(["wise", "qr", "card"]).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Response("Forbidden", { status: 403 });
}

export const createInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CreateInvoiceInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);

    const { rate, source } = await fetchFxRate("USD", data.client_currency);
    const converted = Math.round(data.usd_amount * rate * 100) / 100;
    const invoice_number = await generateInvoiceNumber();
    const issue_date = new Date().toISOString().slice(0, 10);
    const due_date = new Date(Date.now() + data.due_days * 86400_000).toISOString().slice(0, 10);

    let wise_quote_id: string | null = null;
    if (data.payment_method === "wise" && data.client_currency !== "USD") {
      const q = await wiseCreateQuote({ sourceCurrency: "USD", targetCurrency: data.client_currency, sourceAmount: data.usd_amount });
      if (q?.id) wise_quote_id = String(q.id);
    }

    const { data: row, error } = await supabaseAdmin
      .from("invoices")
      .insert({
        invoice_number,
        plan_id: data.plan_id ?? null,
        plan_name: data.plan_name,
        client_name: data.client_name,
        client_email: data.client_email ?? null,
        client_company: data.client_company ?? null,
        client_website: data.client_website ?? null,
        usd_amount: data.usd_amount,
        client_currency: data.client_currency,
        fx_rate: rate,
        converted_amount: converted,
        fx_source: source,
        issue_date,
        due_date,
        payment_method: data.payment_method ?? null,
        wise_quote_id,
        notes: data.notes ?? null,
      })
      .select("*")
      .single();
    if (error) throw new Response(error.message, { status: 500 });
    return row;
  });

export const markInvoicePaid = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), reference: z.string().max(200).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    // Anti-scam guardrail: Wise & Card invoices are auto-confirmed via webhook only.
    // Admin manual mark-as-paid is restricted to QR / manual / offline methods.
    const { data: existing } = await supabaseAdmin
      .from("invoices")
      .select("payment_method,status")
      .eq("id", data.id)
      .maybeSingle();
    if (!existing) throw new Response("Invoice not found", { status: 404 });
    const method = existing.payment_method ?? "manual";
    if (method === "wise" || method === "card") {
      throw new Response(
        "Wise and Card payments are auto-confirmed by the payment provider. Manual mark-as-paid is disabled to prevent fraud.",
        { status: 400 }
      );
    }
    const { data: inv, error } = await supabaseAdmin
      .from("invoices")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        wise_reference: data.reference ?? null,
        verification_status: "verified",
        verified_at: new Date().toISOString(),
        verified_by: context.userId,
      })
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Response(error.message, { status: 500 });
    await supabaseAdmin.from("invoice_payments").insert({
      invoice_id: data.id,
      amount: inv.converted_amount,
      currency: inv.client_currency,
      method,
      reference: data.reference ?? inv.verification_reference ?? null,
    });
    return inv;
  });

// Customer-facing: submit transaction reference (and/or proof URL) for QR/manual payments.
const SubmitVerificationInput = z.object({
  invoice_id: z.string().uuid(),
  reference: z.string().trim().min(3).max(200).optional().nullable(),
  proof_url: z.string().trim().url().max(500).optional().nullable(),
}).refine((v) => !!(v.reference || v.proof_url), { message: "Provide a transaction reference or proof URL." });

export const submitInvoiceVerification = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SubmitVerificationInput.parse(d))
  .handler(async ({ data }) => {
    const { data: inv } = await supabaseAdmin
      .from("invoices")
      .select("id,status,payment_method")
      .eq("id", data.invoice_id)
      .maybeSingle();
    if (!inv) throw new Response("Invoice not found", { status: 404 });
    if (inv.status === "paid") throw new Response("Invoice already paid", { status: 400 });
    if (inv.payment_method === "wise" || inv.payment_method === "card") {
      throw new Response("This payment method is verified automatically — no proof needed.", { status: 400 });
    }
    const { error } = await supabaseAdmin
      .from("invoices")
      .update({
        verification_status: "pending_review",
        verification_reference: data.reference ?? null,
        verification_proof_url: data.proof_url ?? null,
        verification_submitted_at: new Date().toISOString(),
      })
      .eq("id", data.invoice_id);
    if (error) throw new Response(error.message, { status: 500 });
    return { ok: true };
  });

export const updateInvoiceStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), status: z.enum(["pending","paid","failed","cancelled"]) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("invoices").update({ status: data.status, paid_at: data.status === "paid" ? new Date().toISOString() : null }).eq("id", data.id);
    if (error) throw new Response(error.message, { status: 500 });
    return { ok: true };
  });

export const deleteInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("invoices").delete().eq("id", data.id);
    if (error) throw new Response(error.message, { status: 500 });
    return { ok: true };
  });

export const previewFxRate = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ from: z.string(), to: z.string(), amount: z.number() }).parse(d))
  .handler(async ({ data }) => {
    const { rate, source } = await fetchFxRate(data.from, data.to);
    return { rate, source, converted: Math.round(data.amount * rate * 100) / 100 };
  });

/* -------- Public invoice lookup by ID (token-style access) --------
   Returns a sanitized view of the invoice so customers with the link can
   view/pay it without exposing the full table to anon enumeration. */
export const getPublicInvoice = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { data: inv, error } = await supabaseAdmin
      .from("invoices")
      .select(
        "id, invoice_number, plan_id, plan_name, client_name, client_company, client_website, usd_amount, client_currency, fx_rate, converted_amount, issue_date, due_date, status, payment_method, wise_quote_id, verification_status, verification_reference, verification_proof_url, verification_submitted_at, paid_at, created_at, notes"
      )
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Response(error.message, { status: 500 });
    return inv;
  });



/* -------- Public (customer-initiated) invoice creation -------- */
const PublicInvoiceInput = z.object({
  plan_id: z.string().uuid().nullable().optional(),
  client_name: z.string().trim().min(1).max(200),
  client_email: z.string().trim().email().max(255),
  client_website: z.string().trim().max(300).optional().nullable(),
  client_currency: z.string().trim().min(3).max(8).default("USD"),
  payment_method: z.enum(["wise", "qr", "card"]),
  notes: z.string().max(1000).optional().nullable(),
});

export const createPublicInvoice = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PublicInvoiceInput.parse(d))
  .handler(async ({ data }) => {
    // Resolve plan from DB to prevent client tampering with price.
    let plan_name = "Custom Quote";
    let usd_amount = 0;
    if (data.plan_id) {
      const { data: plan } = await supabaseAdmin
        .from("pricing_plans")
        .select("id,name,price,currency,show_price")
        .eq("id", data.plan_id)
        .maybeSingle();
      if (plan) {
        plan_name = plan.name;
        // If plan has hidden price (custom quote), keep amount 0 → admin will quote.
        usd_amount = plan.show_price ? Number(plan.price) || 0 : 0;
      }
    }

    const { rate, source } = await fetchFxRate("USD", data.client_currency);
    const converted = Math.round(usd_amount * rate * 100) / 100;
    const invoice_number = await generateInvoiceNumber();
    const issue_date = new Date().toISOString().slice(0, 10);
    const due_date = new Date(Date.now() + 7 * 86400_000).toISOString().slice(0, 10);

    let wise_quote_id: string | null = null;
    if (data.payment_method === "wise" && usd_amount > 0 && data.client_currency !== "USD") {
      try {
        const q = await wiseCreateQuote({
          sourceCurrency: "USD",
          targetCurrency: data.client_currency,
          sourceAmount: usd_amount,
        });
        if (q?.id) wise_quote_id = String(q.id);
      } catch (e) {
        console.warn("[wise] quote failed", e);
      }
    }

    const { data: row, error } = await supabaseAdmin
      .from("invoices")
      .insert({
        invoice_number,
        plan_id: data.plan_id ?? null,
        plan_name,
        client_name: data.client_name,
        client_email: data.client_email,
        client_website: data.client_website ?? null,
        usd_amount,
        client_currency: data.client_currency,
        fx_rate: rate,
        converted_amount: converted,
        fx_source: source,
        issue_date,
        due_date,
        payment_method: data.payment_method,
        wise_quote_id,
        notes: data.notes ?? null,
        status: "pending",
        verification_status: data.payment_method === "qr" ? "awaiting_proof" : "auto",
      })
      .select("id, invoice_number")
      .single();
    if (error) throw new Response(error.message, { status: 500 });
    return row;
  });
