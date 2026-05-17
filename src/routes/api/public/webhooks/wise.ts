import { createFileRoute } from "@tanstack/react-router";
import crypto from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Wise sends a SHA256 signature using their public key — we verify with WISE_WEBHOOK_PUBLIC_KEY (RSA PEM).
function verifyWise(body: string, signature: string | null): boolean {
  const pubKey = process.env.WISE_WEBHOOK_PUBLIC_KEY;
  if (!pubKey || !signature) return false;
  try {
    const verify = crypto.createVerify("RSA-SHA256");
    verify.update(body);
    return verify.verify(pubKey, Buffer.from(signature, "base64"));
  } catch (e) {
    console.error("[wise webhook] verify error", e);
    return false;
  }
}

export const Route = createFileRoute("/api/public/webhooks/wise")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text();
        const sig = request.headers.get("x-signature-sha256") || request.headers.get("X-Signature-SHA256");
        if (!verifyWise(body, sig)) {
          console.warn("[wise webhook] invalid signature");
          return new Response("invalid signature", { status: 401 });
        }
        let payload: any = {};
        try { payload = JSON.parse(body); } catch {}

        const eventType = payload?.event_type as string | undefined;
        const transferId = payload?.data?.resource?.id;
        const newState = payload?.data?.current_state || payload?.data?.new_state;

        if (eventType?.startsWith("transfers#state-change") && transferId) {
          const matchStatus =
            newState === "outgoing_payment_sent" || newState === "funds_converted" ? "paid" :
            newState === "cancelled" || newState === "bounced_back" ? "failed" : null;

          if (matchStatus) {
            const { data: inv } = await supabaseAdmin
              .from("invoices")
              .select("*")
              .eq("wise_transfer_id", String(transferId))
              .maybeSingle();
            if (inv) {
              await supabaseAdmin.from("invoices").update({
                status: matchStatus,
                paid_at: matchStatus === "paid" ? new Date().toISOString() : null,
                wise_reference: String(transferId),
              }).eq("id", inv.id);
              if (matchStatus === "paid") {
                await supabaseAdmin.from("invoice_payments").insert({
                  invoice_id: inv.id,
                  amount: inv.converted_amount,
                  currency: inv.client_currency,
                  method: "wise",
                  reference: String(transferId),
                  raw_payload: payload,
                });
              }
            }
          }
        }
        return new Response("ok", { status: 200 });
      },
    },
  },
});
