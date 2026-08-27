import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { isAllowlistedAdminEmail } from "@/config/admin";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const email = session?.user?.email;
    if (!session?.user || !isAllowlistedAdminEmail(email)) {
      setIsAdmin(false);
      setRoleLoading(false);
      return;
    }

    // Email matches allowlist (ritesh.bhopal@gmail.com) -> grant admin immediately
    setIsAdmin(true);
    setRoleLoading(false);

    // Also check database user_roles in background
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data) {
          setIsAdmin(true);
        }
      });

    return () => { cancelled = true; };
  }, [session?.user?.id, session?.user?.email]);

  return { session, user: session?.user ?? null as User | null, loading: loading || roleLoading, isAdmin };
}