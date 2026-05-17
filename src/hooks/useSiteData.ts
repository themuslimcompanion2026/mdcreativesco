import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSocialLinks() {
  return useQuery({
    queryKey: ["social_links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePricingPlans() {
  return useQuery({
    queryKey: ["pricing_plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_plans")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePricingSettings() {
  return useQuery({
    queryKey: ["pricing_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useBookingSettings() {
  return useQuery({
    queryKey: ["booking_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useSiteSetting(key: string) {
  return useQuery({
    queryKey: ["site_setting", key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", key)
        .maybeSingle();
      if (error) throw error;
      return data?.value as Record<string, any> | null;
    },
  });
}

export function useStatsItems() {
  return useQuery({
    queryKey: ["stats_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stats_items")
        .select("*")
        .eq("visible", true)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAllStatsItems() {
  return useQuery({
    queryKey: ["stats_items_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stats_items")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePortfolioItems() {
  return useQuery({
    queryKey: ["portfolio_items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_items")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}
