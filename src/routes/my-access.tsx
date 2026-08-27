import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/hooks/use-auth";
import { ArrowUpRight, Lock, LogOut, Clock } from "lucide-react";

export const Route = createFileRoute("/my-access")({
  head: () => ({
    meta: [
      { title: "My Access — StudyTube" },
      { name: "description", content: "Your personal dashboard of StudyTube private apps. Launch any app you've been invited to and check when your access expires." },
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
      <section className="mx-auto max-w-4xl px-4 pt-14 md:pt-20 pb-16">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary">Private</p>
            <h1 className="mt-2 font-display text-3xl md:text-4xl font-semibold tracking-tight">My Access</h1>
            <p className="mt-2 text-sm text-muted-foreground">Apps you've been invited to.</p>
          </div>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/", replace: true }); }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm hover:border-primary"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>

        {isLoading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[0, 1].map((i) => <div key={i} className="h-32 rounded-2xl border border-border gradient-card animate-pulse" />)}
          </div>
        ) : data.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {active.map((r) => {
                if (!r.private_apps || !r.private_apps.projects) return null;
                const embed = r.private_apps.embed_type ?? "link";
                const inApp = embed === "iframe" || embed === "html";
                const inner = (
                  <>
                    <div className="flex items-start justify-between">
                      <h3 className="font-display font-semibold">{r.private_apps.projects.title}</h3>
                      <ArrowUpRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{r.private_apps.projects.description}</p>
                    {r.expires_at && (
                      <p className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> Expires {new Date(r.expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </>
                );
                const cls = "group rounded-2xl border border-border gradient-card p-6 shadow-card hover:border-primary/50 hover:-translate-y-0.5 transition-all block";
                return inApp ? (
                  <Link key={r.id} to="/app/$slug" params={{ slug: r.private_apps.slug }} className={cls}>{inner}</Link>
                ) : (
                  <a key={r.id} href={r.private_apps.app_url} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
                );
              })}
            </div>
            {expired.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-muted-foreground">Expired</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {expired.map((r) => r.private_apps && r.private_apps.projects && (
                    <div key={r.id} className="rounded-2xl border border-border/60 p-5 opacity-60">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <span className="font-medium">{r.private_apps.projects.title}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">Expired {new Date(r.expires_at!).toLocaleDateString()}</p>
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
    <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center">
      <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
      <p className="mt-3 font-display text-lg font-semibold">No private apps yet</p>
      <p className="mt-1 text-sm text-muted-foreground">You'll see invited apps here once access is granted.</p>
      <Link to="/projects" className="mt-5 inline-flex items-center gap-2 rounded-full gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
        Browse public projects
      </Link>
    </div>
  );
}