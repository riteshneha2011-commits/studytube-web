import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Loader2, LogIn, Mail } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — StudyTube" },
      { name: "description", content: "Sign in to StudyTube to access private apps you've been invited to. Use the email and password you were given by Ritesh Agarwal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"magic" | "signin" | "signup">("magic");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const navigate = useNavigate();
  const { session, isAdmin } = useAuth();

  useEffect(() => {
    if (session) navigate({ to: isAdmin ? "/admin" : "/my-access", replace: true });
  }, [session, isAdmin, navigate]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null); setMsg(null); setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");
    try {
      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/my-access` },
        });
        if (error) throw error;
        setMsg("Magic link sent. Check your inbox and click the link to sign in.");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/my-access` },
        });
        if (error) throw error;
        setMsg("Account created. If email confirmation is on, check your inbox.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const title = mode === "magic" ? "Sign in with magic link" : mode === "signin" ? "Sign in" : "Create account";
  const tabs = [
    { key: "magic", label: "Magic link" },
    { key: "signin", label: "Password" },
    { key: "signup", label: "Sign up" },
  ] as const;

  return (
    <SiteLayout>
      <section className="mx-auto max-w-md px-4 pt-14 md:pt-20 pb-16">
        <div className="rounded-2xl border border-border gradient-card p-8 shadow-card">
          <div className="flex rounded-lg border border-border bg-surface p-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => { setMode(t.key); setErr(null); setMsg(null); }}
                className={
                  "flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors " +
                  (mode === t.key
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "magic"
              ? "Enter your email and we'll send you a one-click sign-in link. No password needed."
              : mode === "signin"
                ? "Use the credentials you were given to access private apps."
                : "New here? Set your password."}
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="auth-email" className="text-sm font-medium">Email</label>
              <input id="auth-email" name="email" type="email" required autoComplete="email"
                className="mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
            {mode !== "magic" && (
              <div>
                <label htmlFor="auth-password" className="text-sm font-medium">Password</label>
                <input id="auth-password" name="password" type="password" required minLength={6}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  className="mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
            )}
            {err && <p className="text-sm text-destructive">{err}</p>}
            {msg && <p className="text-sm text-primary">{msg}</p>}
            <button type="submit" disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "magic" ? <Mail className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              {mode === "magic" ? "Send magic link" : mode === "signin" ? "Sign in" : "Sign up"}
            </button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}