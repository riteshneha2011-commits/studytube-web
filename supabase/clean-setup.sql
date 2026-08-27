-- ============================================================================
-- StudyTube: Supabase Schema & Initial Data Setup (Correct Dependency Order)
-- ============================================================================

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE public.access_status AS ENUM ('active', 'expired', 'revoked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.project_category AS ENUM ('Practice', 'Tools', 'Simulations', 'Games');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.project_status AS ENUM ('visible', 'hidden', 'private');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Tables First (so functions can reference them)
CREATE TABLE IF NOT EXISTS public.projects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    category public.project_category NOT NULL,
    external_url text,
    status public.project_status DEFAULT 'visible'::public.project_status NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    thumbnail_url text,
    display_order integer DEFAULT 0 NOT NULL,
    is_coming_soon boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    slug text NOT NULL UNIQUE,
    embed_type text DEFAULT 'link'::text NOT NULL,
    html_content text,
    allow_fullscreen boolean DEFAULT true NOT NULL,
    CONSTRAINT projects_embed_type_check CHECK (embed_type = ANY (ARRAY['link'::text, 'iframe'::text, 'html'::text]))
);

CREATE TABLE IF NOT EXISTS public.private_apps (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    app_url text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    slug text NOT NULL UNIQUE,
    embed_type text DEFAULT 'link'::text NOT NULL,
    html_content text,
    allow_fullscreen boolean DEFAULT true NOT NULL,
    CONSTRAINT private_apps_embed_type_check CHECK (embed_type = ANY (ARRAY['link'::text, 'iframe'::text, 'html'::text]))
);

CREATE TABLE IF NOT EXISTS public.user_access (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email text NOT NULL,
    private_app_id uuid NOT NULL REFERENCES public.private_apps(id) ON DELETE CASCADE,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    status public.access_status DEFAULT 'active'::public.access_status NOT NULL,
    granted_by text
);
CREATE INDEX IF NOT EXISTS user_access_email_idx ON public.user_access USING btree (lower(user_email));

CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role)
);

CREATE TABLE IF NOT EXISTS public.social_links (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    platform text NOT NULL,
    url text NOT NULL,
    icon text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    message text NOT NULL,
    handled boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    phone text,
    CONSTRAINT contact_submissions_lengths CHECK (
        length(name) >= 1 AND length(name) <= 100 AND
        length(email) >= 3 AND length(email) <= 255 AND
        length(message) >= 1 AND length(message) <= 2000 AND
        (phone IS NULL OR (length(phone) >= 3 AND length(phone) <= 30))
    )
);

-- 3. Functions (Defined after tables)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) 
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.touch_updated_at() 
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END; 
$$;

-- 4. Triggers
DROP TRIGGER IF EXISTS projects_touch ON public.projects;
CREATE TRIGGER projects_touch 
BEFORE UPDATE ON public.projects 
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Projects
DROP POLICY IF EXISTS "Public sees visible projects" ON public.projects;
CREATE POLICY "Public sees visible projects" ON public.projects 
FOR SELECT TO authenticated, anon 
USING (status = 'visible'::public.project_status OR public.is_admin());

DROP POLICY IF EXISTS "Admins insert projects" ON public.projects;
CREATE POLICY "Admins insert projects" ON public.projects 
FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins update projects" ON public.projects;
CREATE POLICY "Admins update projects" ON public.projects 
FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins delete projects" ON public.projects;
CREATE POLICY "Admins delete projects" ON public.projects 
FOR DELETE TO authenticated USING (public.is_admin());

-- Private Apps
DROP POLICY IF EXISTS "Access holders see private apps" ON public.private_apps;
CREATE POLICY "Access holders see private apps" ON public.private_apps 
FOR SELECT TO authenticated 
USING (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.user_access ua
    WHERE ua.private_app_id = private_apps.id
      AND lower(ua.user_email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
      AND ua.status = 'active'::public.access_status
      AND (ua.expires_at IS NULL OR ua.expires_at > now())
  )
);

DROP POLICY IF EXISTS "Admins insert private_apps" ON public.private_apps;
CREATE POLICY "Admins insert private_apps" ON public.private_apps 
FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins update private_apps" ON public.private_apps;
CREATE POLICY "Admins update private_apps" ON public.private_apps 
FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins delete private_apps" ON public.private_apps;
CREATE POLICY "Admins delete private_apps" ON public.private_apps 
FOR DELETE TO authenticated USING (public.is_admin());

-- User Access
DROP POLICY IF EXISTS "Users see own access" ON public.user_access;
CREATE POLICY "Users see own access" ON public.user_access 
FOR SELECT TO authenticated 
USING (public.is_admin() OR lower(user_email) = lower(COALESCE(auth.jwt() ->> 'email', '')));

DROP POLICY IF EXISTS "Admins insert access" ON public.user_access;
CREATE POLICY "Admins insert access" ON public.user_access 
FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins update access" ON public.user_access;
CREATE POLICY "Admins update access" ON public.user_access 
FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins delete access" ON public.user_access;
CREATE POLICY "Admins delete access" ON public.user_access 
FOR DELETE TO authenticated USING (public.is_admin());

-- User Roles
DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
CREATE POLICY "Users view own roles" ON public.user_roles 
FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

-- Social Links
DROP POLICY IF EXISTS "Public sees enabled social links" ON public.social_links;
CREATE POLICY "Public sees enabled social links" ON public.social_links 
FOR SELECT TO authenticated, anon 
USING (enabled = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins insert social" ON public.social_links;
CREATE POLICY "Admins insert social" ON public.social_links 
FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins update social" ON public.social_links;
CREATE POLICY "Admins update social" ON public.social_links 
FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins delete social" ON public.social_links;
CREATE POLICY "Admins delete social" ON public.social_links 
FOR DELETE TO authenticated USING (public.is_admin());

-- Contact Submissions
DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact" ON public.contact_submissions 
FOR INSERT TO authenticated, anon 
WITH CHECK (
    length(name) >= 1 AND length(name) <= 100 AND
    length(email) >= 3 AND length(email) <= 255 AND
    length(message) >= 1 AND length(message) <= 2000 AND
    (phone IS NULL OR (length(phone) >= 3 AND length(phone) <= 30))
);

DROP POLICY IF EXISTS "Admins read contact" ON public.contact_submissions;
CREATE POLICY "Admins read contact" ON public.contact_submissions 
FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins update contact" ON public.contact_submissions;
CREATE POLICY "Admins update contact" ON public.contact_submissions 
FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins delete contact" ON public.contact_submissions;
CREATE POLICY "Admins delete contact" ON public.contact_submissions 
FOR DELETE TO authenticated USING (public.is_admin());

-- 7. Permissions & Grants
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 8. Seed Initial Data
INSERT INTO public.projects (id, title, description, category, external_url, status, featured, display_order, is_coming_soon, slug, embed_type, allow_fullscreen)
VALUES
('6930a16b-c48f-4d7c-a957-03fe3b8e3716', 'Classroom Smart Board Games', 'Interactive classroom games for smart boards.', 'Games', 'https://classroom-games.studytube.co.in', 'visible', false, 10, false, 'classroom-smart-board-games', 'link', true),
('beee8276-ba1f-48de-bdf2-7ac0e2bc4251', 'PCMB Practice App', 'Physics, Chemistry, Maths & Biology practice for Class 9–12.', 'Practice', 'https://pcmb.studytube.co.in/', 'visible', true, 20, false, 'pcmb-practice-app', 'link', true),
('e9ea47e1-03d4-49c2-bfb6-69bc93f5edd7', 'Doubt Solving App', 'Get your doubts solved quickly.', 'Tools', 'https://doubt.studytube.co.in/', 'visible', false, 30, false, 'doubt-solving-app', 'link', true),
('37acb60e-42d6-42dd-9c03-9ceabd49f309', 'Chemistry Compounds 3D Visualiser', 'Explore chemistry compounds in 3D.', 'Tools', 'https://chemistryvisualizer.studytube.co.in/', 'visible', false, 40, false, 'chemistry-compounds-3d-visualiser', 'link', true),
('8fd99e51-fbf0-4947-96b5-0a929caf46c8', 'Class 11 & 12 CBSE Board/School Practice Portal', 'CBSE board and school practice portal for Class 11 & 12.', 'Practice', 'https://physicsexamprep.studytube.co.in/', 'visible', false, 50, false, 'class-11-12-cbse-board-school-practice-portal', 'link', true),
('060d39ea-f38e-4f2f-8706-ae2d07a5223b', 'NeuroPlay', 'Fun neuroscience-inspired games.', 'Games', 'https://neuro-play-ra.lovable.app/', 'visible', true, 60, false, 'neuroplay', 'link', true),
('caa10c21-8224-4cae-a610-e3d2269df066', 'Physics Simulations App', 'Interactive physics simulations.', 'Simulations', 'https://simulations.studytube.co.in/', 'visible', true, 70, false, 'physics-simulations-app', 'link', true),
('8e52244e-3319-4d06-bd45-4ef237085440', 'Housie Game', 'Housie Game Board', 'Games', 'https://housie.riteshagarwal.in/', 'private', false, 0, false, 'housie-game', 'link', true),
('e99b13dd-770b-49c9-b3b4-fd5e0459ea4f', 'Prompt Manager', 'Saving prompt and AI information and get then sorted.', 'Tools', 'https://prompt.riteshagarwal.in/', 'private', false, 0, false, 'prompt-manager', 'link', true),
('f53bd2cb-2314-4ad9-9ba8-47248dba9c68', 'Physics Learning with Spaced Repetition', 'Physics Learning, practice with Spaced Repetition for best learning and revision.', 'Practice', 'https://physicscoach.studytube.co.in/', 'visible', true, 0, false, 'physics-learning-with-spaced-repetition', 'link', true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  external_url = EXCLUDED.external_url,
  status = EXCLUDED.status,
  featured = EXCLUDED.featured,
  display_order = EXCLUDED.display_order,
  is_coming_soon = EXCLUDED.is_coming_soon,
  slug = EXCLUDED.slug,
  embed_type = EXCLUDED.embed_type,
  allow_fullscreen = EXCLUDED.allow_fullscreen;

INSERT INTO public.private_apps (id, project_id, app_url, slug, embed_type, allow_fullscreen)
VALUES
('543797ad-d575-4974-9a04-169967085ba5', '8e52244e-3319-4d06-bd45-4ef237085440', 'https://housie.riteshagarwal.in/', 'housie-game', 'link', true),
('92e51990-2508-4a25-9327-67434cd157dd', 'e99b13dd-770b-49c9-b3b4-fd5e0459ea4f', 'https://prompt.riteshagarwal.in/', 'prompt-manager', 'link', true)
ON CONFLICT (id) DO UPDATE SET
  project_id = EXCLUDED.project_id,
  app_url = EXCLUDED.app_url,
  slug = EXCLUDED.slug,
  embed_type = EXCLUDED.embed_type,
  allow_fullscreen = EXCLUDED.allow_fullscreen;

INSERT INTO public.social_links (id, platform, url, icon, enabled, display_order)
VALUES
('71acfe0a-4a99-443e-9cff-ff43cc1d717a', 'Instagram', 'https://www.instagram.com/physicsbyriteshsir', 'instagram', true, 0),
('6ab9c500-b791-45da-ac52-4067142e89b5', 'Youtube', 'https://www.youtube.com/PhysicsByRitesh', 'youtube', true, 0),
('4dbb7f45-d0ff-45e5-804e-2d897983b14f', 'Ritesh Agarwal Classes APP', 'https://rac.courses.store/', 'racapp', true, 0),
('5d00d853-5d2f-4d36-ac7f-84524c0c03e4', 'LinkedIn', 'https://www.linkedin.com/in/riteshagarwal-iitian', 'linkedin', true, 0)
ON CONFLICT (id) DO UPDATE SET
  platform = EXCLUDED.platform,
  url = EXCLUDED.url,
  icon = EXCLUDED.icon,
  enabled = EXCLUDED.enabled,
  display_order = EXCLUDED.display_order;
