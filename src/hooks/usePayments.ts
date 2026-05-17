import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invoices").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: ["invoice", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("invoices").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data;
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
