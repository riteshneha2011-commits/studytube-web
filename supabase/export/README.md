# StudyTube — apne Supabase par shift karne ke steps

`studytube-public-schema-and-data.sql` mein poora `public` schema hai: tables, enums,
functions (`is_admin`, `has_role`, `touch_updated_at`), triggers, RLS policies, GRANTs
aur saara data (projects, private_apps, user_access, social_links, contact_submissions).

`auth` schema (users/passwords) export nahi hota — Supabase use manage karta hai.

## 1. Apne Supabase project mein schema + data daalein

1. https://supabase.com/dashboard → apna project → **SQL Editor**
2. `studytube-public-schema-and-data.sql` ka poora content paste karke **Run** karein.
3. Errors na aayein iske liye project khaali (fresh) hona chahiye.

## 2. Auth setup

1. **Authentication → Providers → Email** ON rakhein (magic link isi se chalta hai).
2. **Authentication → URL Configuration** mein Site URL aur redirect URLs add karein:
   - `https://studytube.co.in`
   - `https://www.studytube.co.in`
3. Apne email (`ritesh.bhopal@gmail.com`) se magic link se ek baar sign in karein.
4. Uske baad SQL Editor mein admin role dein:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'ritesh.bhopal@gmail.com'
on conflict do nothing;
```

## 3. App ko apne project se jodna

Is Lovable project par Cloud (managed backend) laga hua hai, isliye "Connect external
Supabase" option isme available nahi hai — Lovable ka rule hai ki Cloud wale project ka
backend badla nahi ja sakta. Do raste hain:

**A. Naya Lovable project (recommended)**
1. Naya project banayein (Cloud enable **na** karein).
2. Project Settings → Integrations → **Supabase** connect karein (OAuth).
3. Is repo ka code copy karein; `src/integrations/supabase/*` naye project ke generated
   client se replace ho jayega.

**B. Self-host / apna hosting**
Code khud host karein (Vercel/Netlify/Cloudflare) aur ye env vars set karein:

```
VITE_SUPABASE_URL=https://<your-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your anon/publishable key>
SUPABASE_URL=https://<your-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<same key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>   # server-side only
GEMINI_API_KEY=<your Google AI Studio key>     # server-side only
```

## 4. Lovable AI se aazadi

App code mein Lovable AI Gateway ka koi use nahi hai (`LOVABLE_API_KEY` kahin call nahi
hota). AI ke liye aapki `GEMINI_API_KEY` hi server-side secret ke roop mein use hogi.
