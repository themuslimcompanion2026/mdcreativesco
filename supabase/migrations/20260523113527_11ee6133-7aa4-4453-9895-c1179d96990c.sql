
-- 1) Remove public SELECT on invoices (sensitive PII/financial data)
DROP POLICY IF EXISTS "Public can view invoices" ON public.invoices;

-- 2) Restrict site_settings public SELECT to only known-safe keys
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view safe site settings"
ON public.site_settings
FOR SELECT
TO anon, authenticated
USING (key IN ('brand', 'contact', 'seo', 'hero', 'footer'));

-- 3) Tighten storage bucket SELECT policies: public buckets serve via public URL;
--    drop the broad listing policy on storage.objects to prevent enumeration.
DROP POLICY IF EXISTS "Public read site-assets" ON storage.objects;
DROP POLICY IF EXISTS "Public read portfolio" ON storage.objects;
DROP POLICY IF EXISTS "Public read payment-qr" ON storage.objects;

-- 4) Revoke EXECUTE on SECURITY DEFINER helper functions from anon/public.
--    has_role is invoked inside RLS policies; authenticated still needs EXECUTE.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_admin() FROM PUBLIC, anon, authenticated;
