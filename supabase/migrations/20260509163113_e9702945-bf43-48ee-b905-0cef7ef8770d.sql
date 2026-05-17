
ALTER TABLE public.pricing_plans
  ADD COLUMN IF NOT EXISTS show_price boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS monthly_maintenance_price numeric,
  ADD COLUMN IF NOT EXISTS monthly_maintenance_currency text,
  ADD COLUMN IF NOT EXISTS yearly_maintenance_price numeric,
  ADD COLUMN IF NOT EXISTS yearly_maintenance_currency text,
  ADD COLUMN IF NOT EXISTS hidden_price_cta_label text NOT NULL DEFAULT 'Get Custom Quote',
  ADD COLUMN IF NOT EXISTS hidden_price_cta_url text NOT NULL DEFAULT '/book';
