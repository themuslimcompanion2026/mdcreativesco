import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { buildInvoicePdf } from "@/lib/payments.server";

export const Route = createFileRoute("/api/public/invoices/$id/pdf")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { data: inv, error } = await supabaseAdmin.from("invoices").select("*").eq("id", params.id).maybeSingle();
        if (error || !inv) return new Response("Invoice not found", { status: 404 });
        const bytes = await buildInvoicePdf(inv);
        return new Response(new Uint8Array(bytes) as unknown as BodyInit, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${inv.invoice_number}.pdf"`,
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
