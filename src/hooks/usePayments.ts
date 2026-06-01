import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getPublicInvoice } from "@/lib/payments.functions";

async function safe<T>(run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch (err) {
    console.warn("[usePayments] backend unavailable:", err);
    return fallback;
  }
}

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    retry: false,
    queryFn: () =>
      safe(async () => {
        const { data, error } = await supabase.from("invoices").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return data ?? [];
      }, [] as any[]),
  });
}

export function useInvoice(id: string | undefined) {
  const fetchInvoice = useServerFn(getPublicInvoice);
  return useQuery({
    queryKey: ["invoice", id],
    enabled: !!id,
    retry: false,
    queryFn: async () => {
      return await fetchInvoice({ data: { id: id! } });
    },
  });
}

export function useQrCodes(opts: { activeOnly?: boolean } = {}) {
  return useQuery({
    queryKey: ["payment_qr_codes", opts.activeOnly ?? false],
    retry: false,
    queryFn: () =>
      safe(async () => {
        let q = supabase.from("payment_qr_codes").select("*").order("sort_order");
        if (opts.activeOnly) q = q.eq("active", true);
        const { data, error } = await q;
        if (error) throw error;
        return data ?? [];
      }, [] as any[]),
  });
}

