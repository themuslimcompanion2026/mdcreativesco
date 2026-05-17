
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL UNIQUE,
  plan_id uuid REFERENCES public.pricing_plans(id) ON DELETE SET NULL,
  plan_name text NOT NULL,
  client_name text NOT NULL,
  client_email text,
  client_company text,
  client_website text,
  usd_amount numeric(14,2) NOT NULL CHECK (usd_amount >= 0),
  client_currency text NOT NULL DEFAULT 'USD',
  fx_rate numeric(18,8) NOT NULL DEFAULT 1,
  converted_amount numeric(18,2) NOT NULL,
  fx_source text NOT NULL DEFAULT 'exchangerate.host',
  issue_date date NOT NULL DEFAULT (now()::date),
  due_date date NOT NULL DEFAULT ((now() + interval '7 days')::date),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','cancelled')),
  payment_method text CHECK (payment_method IN ('wise','qr','card')),
  wise_quote_id text,
  wise_transfer_id text,
  wise_reference text,
  paid_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_created_at ON public.invoices(created_at DESC);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage invoices" ON public.invoices FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Public can view invoices" ON public.invoices FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.invoice_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount numeric(18,2) NOT NULL,
  currency text NOT NULL,
  method text NOT NULL,
  reference text,
  raw_payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_invoice_payments_invoice ON public.invoice_payments(invoice_id);
ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read payments" ON public.invoice_payments FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'));

CREATE TABLE public.payment_qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  plan_id uuid REFERENCES public.pricing_plans(id) ON DELETE SET NULL,
  image_url text NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_qr_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage qr" ON public.payment_qr_codes FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Public view active qr" ON public.payment_qr_codes FOR SELECT TO anon, authenticated
  USING (active = true);

CREATE TRIGGER trg_invoices_updated BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_qr_updated BEFORE UPDATE ON public.payment_qr_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public) VALUES ('payment-qr','payment-qr', true)
  ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Public read payment-qr" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'payment-qr');
CREATE POLICY "Admins write payment-qr" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment-qr' AND has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update payment-qr" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'payment-qr' AND has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete payment-qr" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'payment-qr' AND has_role(auth.uid(),'admin'));
