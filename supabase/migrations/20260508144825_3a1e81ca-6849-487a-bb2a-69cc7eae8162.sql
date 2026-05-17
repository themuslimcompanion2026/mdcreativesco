
-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Admins can view roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ SITE SETTINGS (key/value) ============
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view site settings" ON public.site_settings
  FOR SELECT USING (true);
CREATE POLICY "Admins manage site settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ SOCIAL LINKS ============
CREATE TABLE public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view social links" ON public.social_links
  FOR SELECT USING (true);
CREATE POLICY "Admins manage social links" ON public.social_links
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ PRICING ============
CREATE TABLE public.pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  billing_label TEXT NOT NULL DEFAULT 'one-time',
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  badge TEXT,
  cta_label TEXT NOT NULL DEFAULT 'Get Started',
  cta_url TEXT NOT NULL DEFAULT '/contact',
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view pricing" ON public.pricing_plans
  FOR SELECT USING (true);
CREATE POLICY "Admins manage pricing" ON public.pricing_plans
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.pricing_settings (
  id INT PRIMARY KEY DEFAULT 1,
  visible BOOLEAN NOT NULL DEFAULT true,
  heading TEXT NOT NULL DEFAULT 'Investment Tiers',
  subheading TEXT NOT NULL DEFAULT 'Premium engineering. Predictable pricing.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);
ALTER TABLE public.pricing_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view pricing settings" ON public.pricing_settings
  FOR SELECT USING (true);
CREATE POLICY "Admins manage pricing settings" ON public.pricing_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ PORTFOLIO ============
CREATE TABLE public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Web',
  image_url TEXT,
  project_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view portfolio" ON public.portfolio_items
  FOR SELECT USING (true);
CREATE POLICY "Admins manage portfolio" ON public.portfolio_items
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ BOOKING ============
CREATE TABLE public.booking_settings (
  id INT PRIMARY KEY DEFAULT 1,
  enabled BOOLEAN NOT NULL DEFAULT true,
  heading TEXT NOT NULL DEFAULT 'Book a Strategy Call',
  subheading TEXT NOT NULL DEFAULT 'A 30-minute call to map your project, audience, and conversion goals.',
  whatsapp_number TEXT NOT NULL DEFAULT '',
  telegram_url TEXT NOT NULL DEFAULT '',
  calendly_url TEXT NOT NULL DEFAULT '',
  cta_primary_label TEXT NOT NULL DEFAULT 'Schedule Call',
  cta_secondary_label TEXT NOT NULL DEFAULT 'Send a Message',
  details_md TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);
ALTER TABLE public.booking_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view booking" ON public.booking_settings
  FOR SELECT USING (true);
CREATE POLICY "Admins manage booking" ON public.booking_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ ANALYTICS ============
CREATE TABLE public.analytics_events (
  id BIGSERIAL PRIMARY KEY,
  path TEXT NOT NULL,
  referrer TEXT,
  country TEXT,
  device TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX analytics_events_created_at_idx ON public.analytics_events (created_at DESC);
CREATE INDEX analytics_events_path_idx ON public.analytics_events (path);

CREATE POLICY "Anyone can log a pageview" ON public.analytics_events
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read analytics" ON public.analytics_events
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ STORAGE ============
INSERT INTO storage.buckets (id, name, public) VALUES
  ('site-assets', 'site-assets', true),
  ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read site-assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-assets');
CREATE POLICY "Admins manage site-assets" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read portfolio" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio');
CREATE POLICY "Admins manage portfolio" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'portfolio' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'portfolio' AND public.has_role(auth.uid(), 'admin'));

-- ============ SEED ============
INSERT INTO public.site_settings (key, value) VALUES
  ('brand', '{"name":"MD Creatives","logo_url":"","logo_redirect_url":"/"}'::jsonb),
  ('contact', '{"email":"hello@mdcreatives.studio","phone":""}'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.pricing_settings (id) VALUES (1) ON CONFLICT DO NOTHING;
INSERT INTO public.booking_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

INSERT INTO public.social_links (platform, url, sort_order) VALUES
  ('twitter', '', 1),
  ('instagram', '', 2),
  ('linkedin', '', 3),
  ('github', '', 4),
  ('facebook', '', 5),
  ('whatsapp', '', 6),
  ('telegram', '', 7)
ON CONFLICT (platform) DO NOTHING;

INSERT INTO public.pricing_plans (name, description, price, currency, billing_label, features, badge, cta_label, cta_url, featured, sort_order) VALUES
  ('Launch', 'For startups ready to make a striking first impression.', 1499, 'USD', 'one-time', '["Custom 5-page site","Premium UI/UX","Mobile-first responsive","Basic SEO","2 rounds of revisions"]'::jsonb, NULL, 'Start Project', '/contact', false, 1),
  ('Signature', 'Our most-loved package. Conversion-engineered, cinematic.', 3499, 'USD', 'one-time', '["Up to 10 pages","Bespoke animations & 3D","Advanced SEO + schema","Conversion analytics","Priority support","4 rounds of revisions"]'::jsonb, 'Most Popular', 'Book a Call', '/contact', true, 2),
  ('Enterprise', 'Full-stack platforms with custom backend & integrations.', 7999, 'USD', 'starting at', '["Unlimited pages","Custom backend & API","Auth + dashboards","CMS & integrations","Dedicated PM","Ongoing optimization"]'::jsonb, 'Premium', 'Talk to Us', '/contact', false, 3)
ON CONFLICT DO NOTHING;
