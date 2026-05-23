import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getPublicInvoice } from "@/lib/payments.functions";

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      // Admin-only: relies on "Admins manage invoices" RLS policy via authed client.
      const { data, error } = await supabase.from("invoices").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useInvoice(id: string | undefined) {
  const fetchInvoice = useServerFn(getPublicInvoice);
  return useQuery({
    queryKey: ["invoice", id],
    enabled: !!id,
    queryFn: async () => {
      // Public lookup via server function — invoices table is not anon-readable.
      return await fetchInvoice({ data: { id: id! } });
    },
  });
}

export function useQrCodes(opts: { activeOnly?: boolean } = {}) {
  return useQuery({
    queryKey: ["payment_qr_codes", opts.activeOnly ?? false],
    queryFn: async () => {
      let q = supabase.from("payment_qr_codes").select("*").order("sort_order");
      if (opts.activeOnly) q = q.eq("active", true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}
