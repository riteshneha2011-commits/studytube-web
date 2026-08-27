ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS phone text;

ALTER TABLE public.contact_submissions DROP CONSTRAINT IF EXISTS contact_submissions_check;

ALTER TABLE public.contact_submissions ADD CONSTRAINT contact_submissions_lengths CHECK (
  length(name) BETWEEN 1 AND 100
  AND length(email) BETWEEN 3 AND 255
  AND length(message) BETWEEN 1 AND 2000
  AND (phone IS NULL OR length(phone) BETWEEN 3 AND 30)
);

DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_submissions;

CREATE POLICY "Anyone can submit contact"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(name) BETWEEN 1 AND 100
  AND length(email) BETWEEN 3 AND 255
  AND length(message) BETWEEN 1 AND 2000
  AND (phone IS NULL OR length(phone) BETWEEN 3 AND 30)
);