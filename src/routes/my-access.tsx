import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/hooks/use-auth";
import { ArrowUpRight, Lock, LogOut, Clock, PlayCircle, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/my-access")({
  head: () => ({
    meta: [
      { title: "My Lab Access — StudyTube" },
      { name: "description", content: "Your personal dashboard of invited StudyTube private apps and tools." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MyAccess,
});

type AccessRow = {
  id: string;
  expires_at: string | null;
  private_apps: {
    id: string;
    app_url: string;
    slug: string;
    embed_type: "link" | "iframe" | "html" | null;
    projects: { title: string; description: string } | null;
  } | null;
};

function MyAccess() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  const { data = [], isLoading } = useQuery({
    queryKey: ["my-access", session?.user?.email],
    enabled: !!session?.user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_access")
        .select("id, expires_at, private_apps(id, app_url, slug, embed_type, projects(title, description))")
        .eq("user_email", session!.user.email!)
        .eq("status", "active");
      if (error) throw error;
      return (data ?? []) as unknown as AccessRow[];
    },
  });

  const now = Date.now();
  const active = data.filter((r) => !r.expires_at || new Date(r.expires_at).getTime() > now);
  const expired = data.filter((r) => r.expires_at && new Date(r.expires_at).getTime() <= now);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 pt-14 md:pt-20 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[color:var(--neon-cyan)] font-bold">
              <ShieldCheck className="h-4 w-4" /> Student & Educator Portal
            </span>
            <h1 className="mt-2 font-display text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
              My Private Apps
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Logged in as <strong className="text-foreground font-mono">{session?.user?.email}</strong>
            </p>
          </div>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/", replace: true }); }}
            className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/80 px-5 py-2.5 text-xs font-bold text-foreground hover:border-[color:var(--destructive)] hover:text-[color:var(--destructive)] transition-colors w-fit"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>

        {isLoading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {[0, 1].map((i) => <div key={i} className="h-36 rounded-3xl border border-border bg-surface/50 animate-pulse" />)}
          </div>
        ) : data.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {active.map((r) => {
                if (!r.private_apps || !r.private_apps.projects) return null;
                const embed = r.private_apps.embed_type ?? "link";
                const inApp = embed === "iframe" || embed === "html";
                const inner = (
                  <div className="group relative flex h-full min-h-[12rem] flex-col justify-between rounded-3xl border border-[color:var(--neon-cyan)]/35 bg-surface/80 backdrop-blur-xl p-6 shadow-card hover:border-[color:var(--neon-cyan)] hover:shadow-glow-cyan transition-all duration-300">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display font-bold text-lg text-foreground group-hover:text-[color:var(--neon-cyan)] transition-colors">
                          {r.private_apps.projects.title}
                        </h3>
                        <span className="h-8 w-8 rounded-xl bg-[color:var(--neon-cyan)]/15 border border-[color:var(--neon-cyan)]/30 flex items-center justify-center text-[color:var(--neon-cyan)] shrink-0">
                          {inApp ? <PlayCircle className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </span>
                      </div>
                      <p className="mt-2 text-xs md:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {r.private_apps.projects.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs">
                      {r.expires_at ? (
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
                          <Clock className="h-3.5 w-3.5 text-[color:var(--neon-amber)]" />
                          Expires {new Date(r.expires_at).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[color:var(--neon-emerald)] font-semibold">Lifetime Access</span>
                      )}
                      <span className="font-bold text-[color:var(--neon-cyan)] inline-flex items-center gap-1">
                        {inApp ? "Launch in Lab" : "Open App"} →
                      </span>
                    </div>
                  </div>
                );

                return inApp ? (
                  <Link key={r.id} to="/app/$slug" params={{ slug: r.private_apps.slug }} className="block h-full">
                    {inner}
                  </Link>
                ) : (
                  <a key={r.id} href={r.private_apps.app_url} target="_blank" rel="noopener noreferrer" className="block h-full">
                    {inner}
                  </a>
                );
              })}
            </div>

            {expired.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xs uppercase font-mono tracking-wider font-bold text-muted-foreground mb-4">Expired Apps</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {expired.map((r) => r.private_apps && r.private_apps.projects && (
                    <div key={r.id} className="rounded-3xl border border-border/40 bg-surface/30 p-6 opacity-60">
                      <div className="flex items-center gap-2 text-foreground font-semibold">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <span>{r.private_apps.projects.title}</span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">Access expired on {new Date(r.expires_at!).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </SiteLayout>
  );
}

function EmptyState() {
  return (
    <div className="mt-12 rounded-3xl border border-dashed border-border/80 bg-surface/30 p-12 text-center">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center text-muted-foreground mb-4">
        <Lock className="h-6 w-6" />
      </div>
      <h2 className="font-display text-xl font-bold text-foreground">No private apps yet</h2>
      <p className="mt-1.5 text-sm text-muted-foreground max-w-md mx-auto">
        When Ritesh Sir grants you access to an invite-only app or institute practice portal, it will appear here.
      </p>
      <Link to="/projects" className="mt-6 inline-flex items-center gap-2 rounded-full gradient-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-glow">
        Browse 10+ Public Projects
      </Link>
    </div>
  );
}