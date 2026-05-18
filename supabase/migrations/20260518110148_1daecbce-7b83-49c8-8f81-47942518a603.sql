-- Seed pricing_settings row so updates persist
INSERT INTO public.pricing_settings (id, visible, heading, subheading)
VALUES (1, true, 'Investment Tiers', 'Premium engineering. Predictable pricing.')
ON CONFLICT (id) DO NOTHING;

-- Extend payment_qr_codes to support multi-method details
ALTER TABLE public.payment_qr_codes
  ADD COLUMN IF NOT EXISTS account_name text,
  ADD COLUMN IF NOT EXISTS account_number text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS payment_link text;