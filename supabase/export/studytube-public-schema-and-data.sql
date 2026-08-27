--
-- PostgreSQL database dump
--

\restrict XbDH8JHnbb28WnmImLQwiFAZKH1jb515HuRtYbCBS1uDe8PfVfH2hF1B0bIPLmR

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: access_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.access_status AS ENUM (
    'active',
    'expired',
    'revoked'
);


--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin'
);


--
-- Name: project_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.project_category AS ENUM (
    'Practice',
    'Tools',
    'Simulations',
    'Games'
);


--
-- Name: project_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.project_status AS ENUM (
    'visible',
    'hidden',
    'private'
);


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin');
$$;


--
-- Name: touch_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.touch_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: contact_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    message text NOT NULL,
    handled boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    phone text,
    CONSTRAINT contact_submissions_lengths CHECK ((((length(name) >= 1) AND (length(name) <= 100)) AND ((length(email) >= 3) AND (length(email) <= 255)) AND ((length(message) >= 1) AND (length(message) <= 2000)) AND ((phone IS NULL) OR ((length(phone) >= 3) AND (length(phone) <= 30)))))
);


--
-- Name: private_apps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.private_apps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    app_url text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    slug text NOT NULL,
    embed_type text DEFAULT 'link'::text NOT NULL,
    html_content text,
    allow_fullscreen boolean DEFAULT true NOT NULL,
    CONSTRAINT private_apps_embed_type_check CHECK ((embed_type = ANY (ARRAY['link'::text, 'iframe'::text, 'html'::text])))
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
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
    slug text NOT NULL,
    embed_type text DEFAULT 'link'::text NOT NULL,
    html_content text,
    allow_fullscreen boolean DEFAULT true NOT NULL,
    CONSTRAINT projects_embed_type_check CHECK ((embed_type = ANY (ARRAY['link'::text, 'iframe'::text, 'html'::text])))
);


--
-- Name: social_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.social_links (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    platform text NOT NULL,
    url text NOT NULL,
    icon text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_access; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_access (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_email text NOT NULL,
    private_app_id uuid NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    status public.access_status DEFAULT 'active'::public.access_status NOT NULL,
    granted_by text
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Data for Name: contact_submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contact_submissions (id, name, email, message, handled, created_at, phone) FROM stdin;
e3278a37-2130-4996-9c68-2abf96d1ed06	Ritesh Agarwal	ritesh.bhopal@gmail.com	test message	f	2026-07-28 10:47:43.110695+00	\N
\.


--
-- Data for Name: private_apps; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.private_apps (id, project_id, app_url, created_at, slug, embed_type, html_content, allow_fullscreen) FROM stdin;
543797ad-d575-4974-9a04-169967085ba5	8e52244e-3319-4d06-bd45-4ef237085440	https://housie.riteshagarwal.in/	2026-07-29 04:25:41.424424+00	housie-game	link	\N	t
92e51990-2508-4a25-9327-67434cd157dd	e99b13dd-770b-49c9-b3b4-fd5e0459ea4f	https://prompt.riteshagarwal.in/	2026-07-29 04:26:57.075608+00	prompt-manager	link	\N	t
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.projects (id, title, description, category, external_url, status, featured, thumbnail_url, display_order, is_coming_soon, created_at, updated_at, slug, embed_type, html_content, allow_fullscreen) FROM stdin;
6930a16b-c48f-4d7c-a957-03fe3b8e3716	Classroom Smart Board Games	Interactive classroom games for smart boards.	Games	https://classroom-games.studytube.co.in	visible	f	\N	10	f	2026-07-28 05:30:03.073681+00	2026-07-28 05:42:34.204025+00	classroom-smart-board-games	link	\N	t
beee8276-ba1f-48de-bdf2-7ac0e2bc4251	PCMB Practice App	Physics, Chemistry, Maths & Biology practice for Class 9–12.	Practice	https://pcmb.studytube.co.in/	visible	t	\N	20	f	2026-07-28 05:30:03.073681+00	2026-07-28 05:42:46.240395+00	pcmb-practice-app	link	\N	t
e9ea47e1-03d4-49c2-bfb6-69bc93f5edd7	Doubt Solving App	Get your doubts solved quickly.	Tools	https://doubt.studytube.co.in/	visible	f	\N	30	f	2026-07-28 05:30:03.073681+00	2026-07-28 05:43:00.088771+00	doubt-solving-app	link	\N	t
37acb60e-42d6-42dd-9c03-9ceabd49f309	Chemistry Compounds 3D Visualiser	Explore chemistry compounds in 3D.	Tools	https://chemistryvisualizer.studytube.co.in/	visible	f	\N	40	f	2026-07-28 05:30:03.073681+00	2026-07-28 05:43:10.845932+00	chemistry-compounds-3d-visualiser	link	\N	t
8fd99e51-fbf0-4947-96b5-0a929caf46c8	Class 11 & 12 CBSE Board/School Practice Portal	CBSE board and school practice portal for Class 11 & 12.	Practice	https://physicsexamprep.studytube.co.in/	visible	f	\N	50	f	2026-07-28 05:30:03.073681+00	2026-07-28 05:43:23.736615+00	class-11-12-cbse-board-school-practice-portal	link	\N	t
060d39ea-f38e-4f2f-8706-ae2d07a5223b	NeuroPlay	Fun neuroscience-inspired games.	Games	https://neuro-play-ra.lovable.app/	visible	t	\N	60	f	2026-07-28 05:30:03.073681+00	2026-07-28 05:43:35.414769+00	neuroplay	link	\N	t
caa10c21-8224-4cae-a610-e3d2269df066	Physics Simulations App	Interactive physics simulations.	Simulations	https://simulations.studytube.co.in/	visible	t	\N	70	f	2026-07-28 05:30:03.073681+00	2026-07-28 05:43:46.094942+00	physics-simulations-app	link	\N	t
8e52244e-3319-4d06-bd45-4ef237085440	Housie Game	Housie Game Board	Games	https://housie.riteshagarwal.in/	private	f	\N	0	f	2026-07-29 04:25:41.148776+00	2026-07-29 04:25:41.148776+00	housie-game	link	\N	t
e99b13dd-770b-49c9-b3b4-fd5e0459ea4f	Prompt Manager	Saving prompt and AI information and get then sorted.	Tools	https://prompt.riteshagarwal.in/	private	f	\N	0	f	2026-07-29 04:26:56.206484+00	2026-07-29 04:26:56.206484+00	prompt-manager	link	\N	t
f53bd2cb-2314-4ad9-9ba8-47248dba9c68	Physics Learning with Spaced Repetition	Physics Learning, practice with Spaced Repetition for best learning and revision.	Practice	https://physicscoach.studytube.co.in/	visible	t	\N	0	f	2026-07-29 05:04:03.582421+00	2026-07-29 05:04:09.648852+00	physics-learning-with-spaced-repetition	link	\N	t
\.


--
-- Data for Name: social_links; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.social_links (id, platform, url, icon, enabled, display_order, created_at) FROM stdin;
71acfe0a-4a99-443e-9cff-ff43cc1d717a	Instagram	https://www.instagram.com/physicsbyriteshsir	instagram	t	0	2026-07-29 04:06:21.381155+00
6ab9c500-b791-45da-ac52-4067142e89b5	Youtube	https://www.youtube.com/PhysicsByRitesh	youtube	t	0	2026-07-29 04:07:13.047361+00
4dbb7f45-d0ff-45e5-804e-2d897983b14f	Ritesh Agarwal Classes APP	https://rac.courses.store/	racapp	t	0	2026-07-29 04:22:31.646365+00
5d00d853-5d2f-4d36-ac7f-84524c0c03e4	LinkedIn	https://www.linkedin.com/in/riteshagarwal-iitian	linkedin	t	0	2026-07-29 04:23:53.905412+00
\.


--
-- Data for Name: user_access; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_access (id, user_email, private_app_id, granted_at, expires_at, status, granted_by) FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_roles (id, user_id, role, created_at) FROM stdin;
ad012256-1a34-40e7-b1ee-d914f07082d8	6aac6670-8d72-4f65-9d5c-f2112f198b68	admin	2026-07-28 05:38:43.097866+00
\.


--
-- Name: contact_submissions contact_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_submissions
    ADD CONSTRAINT contact_submissions_pkey PRIMARY KEY (id);


--
-- Name: private_apps private_apps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.private_apps
    ADD CONSTRAINT private_apps_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: social_links social_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_links
    ADD CONSTRAINT social_links_pkey PRIMARY KEY (id);


--
-- Name: user_access user_access_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_access
    ADD CONSTRAINT user_access_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: private_apps_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX private_apps_slug_key ON public.private_apps USING btree (slug);


--
-- Name: projects_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX projects_slug_key ON public.projects USING btree (slug);


--
-- Name: user_access_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_access_email_idx ON public.user_access USING btree (lower(user_email));


--
-- Name: projects projects_touch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER projects_touch BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: private_apps private_apps_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.private_apps
    ADD CONSTRAINT private_apps_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: user_access user_access_private_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_access
    ADD CONSTRAINT user_access_private_app_id_fkey FOREIGN KEY (private_app_id) REFERENCES public.private_apps(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: private_apps Access holders see private apps; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Access holders see private apps" ON public.private_apps FOR SELECT TO authenticated USING ((public.is_admin() OR (EXISTS ( SELECT 1
   FROM public.user_access ua
  WHERE ((ua.private_app_id = private_apps.id) AND (lower(ua.user_email) = lower(COALESCE((auth.jwt() ->> 'email'::text), ''::text))) AND (ua.status = 'active'::public.access_status) AND ((ua.expires_at IS NULL) OR (ua.expires_at > now())))))));


--
-- Name: user_access Admins delete access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins delete access" ON public.user_access FOR DELETE TO authenticated USING (public.is_admin());


--
-- Name: contact_submissions Admins delete contact; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins delete contact" ON public.contact_submissions FOR DELETE TO authenticated USING (public.is_admin());


--
-- Name: private_apps Admins delete private_apps; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins delete private_apps" ON public.private_apps FOR DELETE TO authenticated USING (public.is_admin());


--
-- Name: projects Admins delete projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins delete projects" ON public.projects FOR DELETE TO authenticated USING (public.is_admin());


--
-- Name: social_links Admins delete social; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins delete social" ON public.social_links FOR DELETE TO authenticated USING (public.is_admin());


--
-- Name: user_access Admins insert access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins insert access" ON public.user_access FOR INSERT TO authenticated WITH CHECK (public.is_admin());


--
-- Name: private_apps Admins insert private_apps; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins insert private_apps" ON public.private_apps FOR INSERT TO authenticated WITH CHECK (public.is_admin());


--
-- Name: projects Admins insert projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.is_admin());


--
-- Name: social_links Admins insert social; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins insert social" ON public.social_links FOR INSERT TO authenticated WITH CHECK (public.is_admin());


--
-- Name: contact_submissions Admins read contact; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins read contact" ON public.contact_submissions FOR SELECT TO authenticated USING (public.is_admin());


--
-- Name: user_access Admins update access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins update access" ON public.user_access FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: contact_submissions Admins update contact; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins update contact" ON public.contact_submissions FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: private_apps Admins update private_apps; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins update private_apps" ON public.private_apps FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: projects Admins update projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins update projects" ON public.projects FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: social_links Admins update social; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins update social" ON public.social_links FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: contact_submissions Anyone can submit contact; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can submit contact" ON public.contact_submissions FOR INSERT TO authenticated, anon WITH CHECK ((((length(name) >= 1) AND (length(name) <= 100)) AND ((length(email) >= 3) AND (length(email) <= 255)) AND ((length(message) >= 1) AND (length(message) <= 2000)) AND ((phone IS NULL) OR ((length(phone) >= 3) AND (length(phone) <= 30)))));


--
-- Name: social_links Public sees enabled social links; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public sees enabled social links" ON public.social_links FOR SELECT TO authenticated, anon USING (((enabled = true) OR public.is_admin()));


--
-- Name: projects Public sees visible projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public sees visible projects" ON public.projects FOR SELECT TO authenticated, anon USING (((status = 'visible'::public.project_status) OR public.is_admin()));


--
-- Name: user_access Users see own access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users see own access" ON public.user_access FOR SELECT TO authenticated USING ((public.is_admin() OR (lower(user_email) = lower(COALESCE((auth.jwt() ->> 'email'::text), ''::text)))));


--
-- Name: user_roles Users view own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: contact_submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: private_apps; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.private_apps ENABLE ROW LEVEL SECURITY;

--
-- Name: projects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

--
-- Name: social_links; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

--
-- Name: user_access; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_access ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA public TO sandbox_exec;


--
-- Name: FUNCTION has_role(_user_id uuid, _role public.app_role); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.has_role(_user_id uuid, _role public.app_role) TO anon;
GRANT ALL ON FUNCTION public.has_role(_user_id uuid, _role public.app_role) TO authenticated;
GRANT ALL ON FUNCTION public.has_role(_user_id uuid, _role public.app_role) TO service_role;


--
-- Name: FUNCTION is_admin(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.is_admin() TO anon;
GRANT ALL ON FUNCTION public.is_admin() TO authenticated;
GRANT ALL ON FUNCTION public.is_admin() TO service_role;


--
-- Name: FUNCTION touch_updated_at(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.touch_updated_at() TO anon;
GRANT ALL ON FUNCTION public.touch_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.touch_updated_at() TO service_role;


--
-- Name: TABLE contact_submissions; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.contact_submissions TO anon;
GRANT ALL ON TABLE public.contact_submissions TO authenticated;
GRANT ALL ON TABLE public.contact_submissions TO service_role;
GRANT SELECT,INSERT ON TABLE public.contact_submissions TO sandbox_exec;


--
-- Name: TABLE private_apps; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.private_apps TO anon;
GRANT ALL ON TABLE public.private_apps TO authenticated;
GRANT ALL ON TABLE public.private_apps TO service_role;
GRANT SELECT,INSERT ON TABLE public.private_apps TO sandbox_exec;


--
-- Name: TABLE projects; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.projects TO anon;
GRANT ALL ON TABLE public.projects TO authenticated;
GRANT ALL ON TABLE public.projects TO service_role;
GRANT SELECT,INSERT ON TABLE public.projects TO sandbox_exec;


--
-- Name: TABLE social_links; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.social_links TO anon;
GRANT ALL ON TABLE public.social_links TO authenticated;
GRANT ALL ON TABLE public.social_links TO service_role;
GRANT SELECT,INSERT ON TABLE public.social_links TO sandbox_exec;


--
-- Name: TABLE user_access; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.user_access TO anon;
GRANT ALL ON TABLE public.user_access TO authenticated;
GRANT ALL ON TABLE public.user_access TO service_role;
GRANT SELECT,INSERT ON TABLE public.user_access TO sandbox_exec;


--
-- Name: TABLE user_roles; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.user_roles TO anon;
GRANT ALL ON TABLE public.user_roles TO authenticated;
GRANT ALL ON TABLE public.user_roles TO service_role;
GRANT SELECT,INSERT ON TABLE public.user_roles TO sandbox_exec;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,USAGE ON SEQUENCES TO sandbox_exec;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT ON TABLES TO sandbox_exec;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--

\unrestrict XbDH8JHnbb28WnmImLQwiFAZKH1jb515HuRtYbCBS1uDe8PfVfH2hF1B0bIPLmR

