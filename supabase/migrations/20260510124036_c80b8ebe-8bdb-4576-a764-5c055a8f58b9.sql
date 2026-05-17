CREATE TABLE public.stats_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  prefix TEXT NOT NULL DEFAULT '',
  suffix TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'Sparkles',
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.stats_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view stats" ON public.stats_items FOR SELECT USING (true);
CREATE POLICY "Admins manage stats" ON public.stats_items FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.stats_items (label, value, suffix, icon, sort_order) VALUES
  ('Projects Completed', 120, '+', 'Briefcase', 1),
  ('Client Satisfaction', 99, '%', 'Heart', 2),
  ('Avg. Conversion Growth', 312, '%', 'TrendingUp', 3),
  ('Businesses Helped', 80, '+', 'Building2', 4),
  ('Years of Expertise', 7, '', 'Award', 5);