import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Loader2, LogIn, Mail, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — StudyTube Lab" },
      { name: "description", content: "Sign in to StudyTube with Magic Link to access private apps and your learning portal." },
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
        setMsg("Magic link sent! Check your inbox and tap the link to sign in.");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/my-access` },
        });
        if (error) throw error;
        setMsg("Account created! Check your email for confirmation.");
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

  const tabs = [
    { key: "magic", label: "Magic Link (Passwordless)" },
    { key: "signin", label: "Password Login" },
    { key: "signup", label: "Sign Up" },
  ] as const;

  return (
    <SiteLayout>
      <section className="mx-auto max-w-md px-4 pt-14 md:pt-24 pb-20">
        <div className="rounded-3xl border border-[color:var(--neon-cyan)]/35 bg-surface/80 backdrop-blur-2xl p-8 md:p-10 shadow-card hover:shadow-glow-cyan transition-all">
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[color:var(--neon-cyan)]">
              <Sparkles className="h-3.5 w-3.5" /> Lab Authentication
            </span>
            <h1 className="mt-2 font-display text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              {mode === "magic" ? "Sign In With Magic Link" : mode === "signin" ? "Sign In" : "Create Account"}
            </h1>
            <p className="mt-2 text-xs md:text-sm text-muted-foreground">
              {mode === "magic"
                ? "Enter your email to receive a 1-click passwordless login link."
                : mode === "signin"
                  ? "Access your private learning apps with your credentials."
                  : "Sign up to track private lab assignments."}
            </p>
          </div>

          <div className="flex rounded-full border border-border bg-surface-elevated p-1 mb-6">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => { setMode(t.key); setErr(null); setMsg(null); }}
                className={
                  "flex-1 rounded-full px-3 py-1.5 text-xs font-bold transition-all " +
                  (mode === t.key
                    ? "bg-[color:var(--neon-cyan)] text-background shadow-glow-cyan"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {t.key === "magic" ? "Magic Link" : t.key === "signin" ? "Password" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="auth-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</label>
              <input
                id="auth-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="name@example.com"
                className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/90 px-4 py-2.5 text-sm text-foreground focus:border-[color:var(--neon-cyan)] focus:ring-1 focus:ring-[color:var(--neon-cyan)] outline-none"
              />
            </div>

            {mode !== "magic" && (
              <div>
                <label htmlFor="auth-password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                <input
                  id="auth-password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  placeholder="••••••••"
                  className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/90 px-4 py-2.5 text-sm text-foreground focus:border-[color:var(--neon-cyan)] focus:ring-1 focus:ring-[color:var(--neon-cyan)] outline-none"
                />
              </div>
            )}

            {err && <p className="text-xs text-[color:var(--destructive)] font-medium">{err}</p>}
            {msg && <p className="text-xs text-[color:var(--neon-emerald)] font-medium">{msg}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full gradient-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow hover:opacity-95 disabled:opacity-60 transition-all"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "magic" ? <Mail className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              {mode === "magic" ? "Send Magic Link" : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}