
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin');
$$;

CREATE TYPE public.project_category AS ENUM ('Practice', 'Tools', 'Simulations', 'Games');
CREATE TYPE public.project_status AS ENUM ('visible', 'hidden', 'private');
CREATE TYPE public.access_status AS ENUM ('active', 'expired', 'revoked');

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category public.project_category NOT NULL,
  external_url TEXT,
  status public.project_status NOT NULL DEFAULT 'visible',
  featured BOOLEAN NOT NULL DEFAULT false,
  thumbnail_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_coming_soon BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public sees visible projects" ON public.projects FOR SELECT TO anon, authenticated
  USING (status = 'visible' OR public.is_admin());
CREATE POLICY "Admins insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins update projects" ON public.projects FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete projects" ON public.projects FOR DELETE TO authenticated USING (public.is_admin());

CREATE TABLE public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.social_links TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.social_links TO authenticated;
GRANT ALL ON public.social_links TO service_role;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public sees enabled social links" ON public.social_links FOR SELECT TO anon, authenticated
  USING (enabled = true OR public.is_admin());
CREATE POLICY "Admins insert social" ON public.social_links FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins update social" ON public.social_links FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete social" ON public.social_links FOR DELETE TO authenticated USING (public.is_admin());

CREATE TABLE public.private_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  app_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.private_apps TO authenticated;
GRANT ALL ON public.private_apps TO service_role;
ALTER TABLE public.private_apps ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  private_app_id UUID NOT NULL REFERENCES public.private_apps(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  status public.access_status NOT NULL DEFAULT 'active',
  granted_by TEXT
);
CREATE INDEX user_access_email_idx ON public.user_access (lower(user_email));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_access TO authenticated;
GRANT ALL ON public.user_access TO service_role;
ALTER TABLE public.user_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own access" ON public.user_access FOR SELECT TO authenticated USING (
  public.is_admin() OR lower(user_email) = lower(coalesce((auth.jwt() ->> 'email'), ''))
);
CREATE POLICY "Admins insert access" ON public.user_access FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins update access" ON public.user_access FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete access" ON public.user_access FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Access holders see private apps" ON public.private_apps FOR SELECT TO authenticated USING (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.user_access ua
    WHERE ua.private_app_id = private_apps.id
      AND lower(ua.user_email) = lower(coalesce((auth.jwt() ->> 'email'), ''))
      AND ua.status = 'active'
      AND (ua.expires_at IS NULL OR ua.expires_at > now())
  )
);
CREATE POLICY "Admins insert private_apps" ON public.private_apps FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins update private_apps" ON public.private_apps FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete private_apps" ON public.private_apps FOR DELETE TO authenticated USING (public.is_admin());

CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  handled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_submissions TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_submissions TO authenticated;
GRANT ALL ON public.contact_submissions TO service_role;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact" ON public.contact_submissions FOR INSERT TO anon, authenticated WITH CHECK (
  length(name) BETWEEN 1 AND 100
  AND length(email) BETWEEN 3 AND 255
  AND length(message) BETWEEN 1 AND 2000
);
CREATE POLICY "Admins read contact" ON public.contact_submissions FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins update contact" ON public.contact_submissions FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete contact" ON public.contact_submissions FOR DELETE TO authenticated USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER projects_touch BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.projects (title, description, category, status, featured, display_order, is_coming_soon) VALUES
('PCMB Practice App', 'Chapter-wise practice for Physics, Chemistry, Math & Biology — Class 9–12, JEE, NEET.', 'Practice', 'visible', true, 1, false),
('Doubt Solving App', 'Ask a doubt, get a step-by-step explanation. Built for students, not teachers.', 'Tools', 'visible', true, 2, false),
('Chemistry Compounds 3D Visualiser', 'Rotate and explore molecular structures in real 3D — bond angles, geometry, everything.', 'Tools', 'visible', false, 3, false),
('Class 11 & 12 CBSE Board/School Practice Portal', 'NCERT-aligned practice for CBSE board and school exams. Chapter tests, PYQs, and progress tracking.', 'Practice', 'visible', true, 4, false),
('NeuroPlay', 'Bite-sized memory and logic games. Sharpen focus in 5 minutes a day.', 'Games', 'visible', false, 5, false),
('Physics Simulations App', 'Interactive simulations for mechanics, waves, optics and more. See the concept, not just the formula.', 'Simulations', 'visible', false, 6, false);

INSERT INTO public.social_links (platform, url, icon, enabled, display_order) VALUES
('Instagram', 'https://instagram.com/', 'instagram', true, 1),
('YouTube', 'https://youtube.com/', 'youtube', true, 2);
