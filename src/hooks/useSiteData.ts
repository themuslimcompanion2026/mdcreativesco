import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// SSR-safe wrapper: if Supabase env vars aren't configured (e.g. on a fresh
// Cloudflare Pages deploy with no vars set), accessing `supabase` throws.
// We swallow that and any network/RLS errors so the public site still
// renders with empty data instead of crashing into the 500 fallback.
async function safeQuery<T>(run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch (err) {
    if (typeof console !== "undefined") {
      console.warn("[useSiteData] backend unavailable, using fallback:", err);
    }
    return fallback;
  }
}

const baseOpts = {
  retry: false,
  staleTime: 60_000,
  refetchOnWindowFocus: false,
} as const;

export function useSocialLinks() {
  return useQuery({
    ...baseOpts,
    queryKey: ["social_links"],
    queryFn: () =>
      safeQuery(async () => {
        const { data, error } = await supabase.from("social_links").select("*").order("sort_order");
        if (error) throw error;
        return data ?? [];
      }, [] as any[]),
  });
}

export function usePricingPlans() {
  return useQuery({
    ...baseOpts,
    queryKey: ["pricing_plans"],
    queryFn: () =>
      safeQuery(async () => {
        const { data, error } = await supabase.from("pricing_plans").select("*").order("sort_order");
        if (error) throw error;
        return data ?? [];
      }, [] as any[]),
  });
}

export function usePricingSettings() {
  return useQuery({
    ...baseOpts,
    queryKey: ["pricing_settings"],
    queryFn: () =>
      safeQuery(async () => {
        const { data, error } = await supabase.from("pricing_settings").select("*").eq("id", 1).maybeSingle();
        if (error) throw error;
        return data;
      }, null as any),
  });
}

export function useBookingSettings() {
  return useQuery({
    ...baseOpts,
    queryKey: ["booking_settings"],
    queryFn: () =>
      safeQuery(async () => {
        const { data, error } = await supabase.from("booking_settings").select("*").eq("id", 1).maybeSingle();
        if (error) throw error;
        return data;
      }, null as any),
  });
}

export function useSiteSetting(key: string) {
  return useQuery({
    ...baseOpts,
    queryKey: ["site_setting", key],
    queryFn: () =>
      safeQuery(async () => {
        const { data, error } = await supabase.from("site_settings").select("value").eq("key", key).maybeSingle();
        if (error) throw error;
        return (data?.value as Record<string, any> | null) ?? null;
      }, null as Record<string, any> | null),
  });
}

export function useStatsItems() {
  return useQuery({
    ...baseOpts,
    queryKey: ["stats_items"],
    queryFn: () =>
      safeQuery(async () => {
        const { data, error } = await supabase
          .from("stats_items")
          .select("*")
          .eq("visible", true)
          .order("sort_order");
        if (error) throw error;
        return data ?? [];
      }, [] as any[]),
  });
}

export function useAllStatsItems() {
  return useQuery({
    ...baseOpts,
    queryKey: ["stats_items_all"],
    queryFn: () =>
      safeQuery(async () => {
        const { data, error } = await supabase.from("stats_items").select("*").order("sort_order");
        if (error) throw error;
        return data ?? [];
      }, [] as any[]),
  });
}

export function usePortfolioItems() {
  return useQuery({
    ...baseOpts,
    queryKey: ["portfolio_items"],
    queryFn: () =>
      safeQuery(async () => {
        const { data, error } = await supabase.from("portfolio_items").select("*").order("sort_order");
        if (error) throw error;
        return data ?? [];
      }, [] as any[]),
  });
}
