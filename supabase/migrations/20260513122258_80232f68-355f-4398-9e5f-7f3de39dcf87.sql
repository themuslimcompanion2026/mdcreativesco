
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS verification_reference text,
  ADD COLUMN IF NOT EXISTS verification_proof_url text,
  ADD COLUMN IF NOT EXISTS verification_submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by uuid;
