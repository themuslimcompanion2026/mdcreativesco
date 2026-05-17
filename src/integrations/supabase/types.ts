export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          country: string | null
          created_at: string
          device: string | null
          id: number
          path: string
          referrer: string | null
          session_id: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          device?: string | null
          id?: number
          path: string
          referrer?: string | null
          session_id?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          device?: string | null
          id?: number
          path?: string
          referrer?: string | null
          session_id?: string | null
        }
        Relationships: []
      }
      booking_settings: {
        Row: {
          calendly_url: string
          cta_primary_label: string
          cta_secondary_label: string
          details_md: string
          enabled: boolean
          heading: string
          id: number
          subheading: string
          telegram_url: string
          updated_at: string
          whatsapp_number: string
        }
        Insert: {
          calendly_url?: string
          cta_primary_label?: string
          cta_secondary_label?: string
          details_md?: string
          enabled?: boolean
          heading?: string
          id?: number
          subheading?: string
          telegram_url?: string
          updated_at?: string
          whatsapp_number?: string
        }
        Update: {
          calendly_url?: string
          cta_primary_label?: string
          cta_secondary_label?: string
          details_md?: string
          enabled?: boolean
          heading?: string
          id?: number
          subheading?: string
          telegram_url?: string
          updated_at?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
      invoice_payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          invoice_id: string
          method: string
          raw_payload: Json | null
          reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          id?: string
          invoice_id: string
          method: string
          raw_payload?: Json | null
          reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          invoice_id?: string
          method?: string
          raw_payload?: Json | null
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_company: string | null
          client_currency: string
          client_email: string | null
          client_name: string
          client_website: string | null
          converted_amount: number
          created_at: string
          due_date: string
          fx_rate: number
          fx_source: string
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          plan_id: string | null
          plan_name: string
          status: string
          updated_at: string
          usd_amount: number
          verification_proof_url: string | null
          verification_reference: string | null
          verification_status: string
          verification_submitted_at: string | null
          verified_at: string | null
          verified_by: string | null
          wise_quote_id: string | null
          wise_reference: string | null
          wise_transfer_id: string | null
        }
        Insert: {
          client_company?: string | null
          client_currency?: string
          client_email?: string | null
          client_name: string
          client_website?: string | null
          converted_amount: number
          created_at?: string
          due_date?: string
          fx_rate?: number
          fx_source?: string
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          plan_id?: string | null
          plan_name: string
          status?: string
          updated_at?: string
          usd_amount: number
          verification_proof_url?: string | null
          verification_reference?: string | null
          verification_status?: string
          verification_submitted_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
          wise_quote_id?: string | null
          wise_reference?: string | null
          wise_transfer_id?: string | null
        }
        Update: {
          client_company?: string | null
          client_currency?: string
          client_email?: string | null
          client_name?: string
          client_website?: string | null
          converted_amount?: number
          created_at?: string
          due_date?: string
          fx_rate?: number
          fx_source?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          plan_id?: string | null
          plan_name?: string
          status?: string
          updated_at?: string
          usd_amount?: number
          verification_proof_url?: string | null
          verification_reference?: string | null
          verification_status?: string
          verification_submitted_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
          wise_quote_id?: string | null
          wise_reference?: string | null
          wise_transfer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "pricing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_qr_codes: {
        Row: {
          active: boolean
          created_at: string
          currency: string
          id: string
          image_url: string
          label: string
          plan_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          currency?: string
          id?: string
          image_url: string
          label: string
          plan_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          currency?: string
          id?: string
          image_url?: string
          label?: string
          plan_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_qr_codes_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "pricing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_items: {
        Row: {
          category: string
          created_at: string
          description: string
          featured: boolean
          id: string
          image_url: string | null
          project_url: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          image_url?: string | null
          project_url?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          image_url?: string | null
          project_url?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          badge: string | null
          billing_label: string
          created_at: string
          cta_label: string
          cta_url: string
          currency: string
          description: string
          featured: boolean
          features: Json
          hidden_price_cta_label: string
          hidden_price_cta_url: string
          id: string
          monthly_maintenance_currency: string | null
          monthly_maintenance_description: string | null
          monthly_maintenance_price: number | null
          name: string
          note: string | null
          price: number
          show_price: boolean
          sort_order: number
          updated_at: string
          yearly_maintenance_currency: string | null
          yearly_maintenance_description: string | null
          yearly_maintenance_price: number | null
        }
        Insert: {
          badge?: string | null
          billing_label?: string
          created_at?: string
          cta_label?: string
          cta_url?: string
          currency?: string
          description?: string
          featured?: boolean
          features?: Json
          hidden_price_cta_label?: string
          hidden_price_cta_url?: string
          id?: string
          monthly_maintenance_currency?: string | null
          monthly_maintenance_description?: string | null
          monthly_maintenance_price?: number | null
          name: string
          note?: string | null
          price?: number
          show_price?: boolean
          sort_order?: number
          updated_at?: string
          yearly_maintenance_currency?: string | null
          yearly_maintenance_description?: string | null
          yearly_maintenance_price?: number | null
        }
        Update: {
          badge?: string | null
          billing_label?: string
          created_at?: string
          cta_label?: string
          cta_url?: string
          currency?: string
          description?: string
          featured?: boolean
          features?: Json
          hidden_price_cta_label?: string
          hidden_price_cta_url?: string
          id?: string
          monthly_maintenance_currency?: string | null
          monthly_maintenance_description?: string | null
          monthly_maintenance_price?: number | null
          name?: string
          note?: string | null
          price?: number
          show_price?: boolean
          sort_order?: number
          updated_at?: string
          yearly_maintenance_currency?: string | null
          yearly_maintenance_description?: string | null
          yearly_maintenance_price?: number | null
        }
        Relationships: []
      }
      pricing_settings: {
        Row: {
          heading: string
          id: number
          subheading: string
          updated_at: string
          visible: boolean
        }
        Insert: {
          heading?: string
          id?: number
          subheading?: string
          updated_at?: string
          visible?: boolean
        }
        Update: {
          heading?: string
          id?: number
          subheading?: string
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      social_links: {
        Row: {
          id: string
          platform: string
          sort_order: number
          updated_at: string
          url: string
        }
        Insert: {
          id?: string
          platform: string
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Update: {
          id?: string
          platform?: string
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      stats_items: {
        Row: {
          created_at: string
          icon: string
          id: string
          label: string
          prefix: string
          sort_order: number
          suffix: string
          updated_at: string
          value: number
          visible: boolean
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          label: string
          prefix?: string
          sort_order?: number
          suffix?: string
          updated_at?: string
          value?: number
          visible?: boolean
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          label?: string
          prefix?: string
          sort_order?: number
          suffix?: string
          updated_at?: string
          value?: number
          visible?: boolean
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor"],
    },
  },
} as const
