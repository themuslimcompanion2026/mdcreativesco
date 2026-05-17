ALTER TABLE public.pricing_plans
ADD COLUMN IF NOT EXISTS monthly_maintenance_description text,
ADD COLUMN IF NOT EXISTS yearly_maintenance_description text;