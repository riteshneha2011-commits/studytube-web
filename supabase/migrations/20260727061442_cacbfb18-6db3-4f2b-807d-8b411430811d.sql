
-- projects
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS embed_type text NOT NULL DEFAULT 'link',
  ADD COLUMN IF NOT EXISTS html_content text,
  ADD COLUMN IF NOT EXISTS allow_fullscreen boolean NOT NULL DEFAULT true;

ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_embed_type_check;
ALTER TABLE public.projects
  ADD CONSTRAINT projects_embed_type_check CHECK (embed_type IN ('link','iframe','html'));

-- backfill slugs
UPDATE public.projects
SET slug = regexp_replace(lower(trim(title)), '[^a-z0-9]+', '-', 'g')
WHERE slug IS NULL OR slug = '';

-- ensure uniqueness by appending short id when duplicates
UPDATE public.projects p
SET slug = p.slug || '-' || substring(p.id::text, 1, 6)
WHERE EXISTS (
  SELECT 1 FROM public.projects p2 WHERE p2.slug = p.slug AND p2.id <> p.id
);

ALTER TABLE public.projects
  ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_key ON public.projects(slug);

-- private_apps
ALTER TABLE public.private_apps
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS embed_type text NOT NULL DEFAULT 'link',
  ADD COLUMN IF NOT EXISTS html_content text,
  ADD COLUMN IF NOT EXISTS allow_fullscreen boolean NOT NULL DEFAULT true;

ALTER TABLE public.private_apps
  DROP CONSTRAINT IF EXISTS private_apps_embed_type_check;
ALTER TABLE public.private_apps
  ADD CONSTRAINT private_apps_embed_type_check CHECK (embed_type IN ('link','iframe','html'));

UPDATE public.private_apps
SET slug = 'app-' || substring(id::text, 1, 8)
WHERE slug IS NULL OR slug = '';

ALTER TABLE public.private_apps
  ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS private_apps_slug_key ON public.private_apps(slug);
