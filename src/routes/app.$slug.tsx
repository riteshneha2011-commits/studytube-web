import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, ExternalLink, Maximize2, Loader2, Lock, Sparkles } from "lucide-react";

export const Route = createFileRoute("/app/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — StudyTube Lab` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AppViewer,
});

type Embed = {
  kind: "public" | "private";
  id: string;
  title: string;
  embed_type: "link" | "iframe" | "html";
  external_url: string | null;
  html_content: string | null;
  allow_fullscreen: boolean;
};

function AppViewer() {
  const { slug } = Route.useParams();
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [iframeFailed, setIframeFailed] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["embed", slug, session?.user?.email ?? null],
    queryFn: async (): Promise<Embed | null> => {
      // Try public project first
      const { data: pub } = await supabase
        .from("projects")
        .select("id, title, embed_type, external_url, html_content, allow_fullscreen, status")
        .eq("slug", slug)
        .eq("status", "visible")
        .maybeSingle();
      if (pub) {
        return {
          kind: "public",
          id: pub.id,
          title: pub.title,
          embed_type: (pub.embed_type as Embed["embed_type"]) ?? "link",
          external_url: pub.external_url,
          html_content: pub.html_content,
          allow_fullscreen: pub.allow_fullscreen ?? true,
        };
      }
      // Private: needs signed-in session + access row
      if (!session?.user?.email) return null;
      const { data: priv } = await supabase
        .from("private_apps")
        .select("id, app_url, embed_type, html_content, allow_fullscreen, projects(title)")
        .eq("slug", slug)
        .maybeSingle();
      if (!priv) return null;
      const { data: access } = await supabase
        .from("user_access")
        .select("id, expires_at, status")
        .eq("private_app_id", priv.id)
        .eq("user_email", session.user.email)
        .eq("status", "active")
        .maybeSingle();
      if (!access) return null;
      if (access.expires_at && new Date(access.expires_at).getTime() <= Date.now()) return null;
      return {
        kind: "private",
        id: priv.id,
        title: (priv.projects as { title?: string } | null)?.title ?? "Private app",
        embed_type: (priv.embed_type as Embed["embed_type"]) ?? "link",
        external_url: priv.app_url,
        html_content: priv.html_content,
        allow_fullscreen: priv.allow_fullscreen ?? true,
      };
    },
    enabled: !authLoading,
  });

  // Detect iframe X-Frame-Options blocks (no load event within timeout)
  useEffect(() => {
    setIframeFailed(false);
    if (!data || data.embed_type !== "iframe") return;
    let loaded = false;
    const el = frameRef.current;
    const onLoad = () => { loaded = true; };
    el?.addEventListener("load", onLoad);
    const t = setTimeout(() => { if (!loaded) setIframeFailed(true); }, 6000);
    return () => { clearTimeout(t); el?.removeEventListener("load", onLoad); };
  }, [data]);

  function goFullscreen() {
    const el = frameRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  }

  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-[color:var(--neon-cyan)]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md text-center rounded-3xl border border-border/80 bg-surface/80 backdrop-blur-2xl p-8 shadow-card">
          <Lock className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <h1 className="font-display text-2xl font-bold text-foreground">App Access Required</h1>
          <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed">
            This learning app is invite-only, unpublished, or you are not currently signed in with an authorized email.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/projects" className="rounded-full border border-border/80 bg-surface-elevated px-5 py-2.5 text-xs font-bold hover:border-[color:var(--neon-cyan)]">
              Browse Public Apps
            </Link>
            {!session && (
              <button onClick={() => navigate({ to: "/auth" })} className="rounded-full gradient-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-glow">
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 'link' mode → show launch hub card
  if (data.embed_type === "link") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md text-center rounded-3xl border border-[color:var(--neon-cyan)]/35 bg-surface/90 backdrop-blur-2xl p-8 md:p-10 shadow-card hover:shadow-glow-cyan transition-all">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[color:var(--neon-cyan)] mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Standalone App
          </span>
          <h1 className="font-display text-2xl font-bold text-foreground">{data.title}</h1>
          <p className="mt-2 text-xs md:text-sm text-muted-foreground">This interactive tool runs in a full-screen standalone window.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to={data.kind === "private" ? "/my-access" : "/projects"} className="rounded-full border border-border/80 bg-surface-elevated px-5 py-2.5 text-xs font-bold hover:border-primary">
              Back to Catalog
            </Link>
            {data.external_url && (
              <a href={data.external_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full gradient-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-glow hover:opacity-95">
                Launch App <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between gap-3 border-b border-border/60 bg-surface/90 backdrop-blur-xl px-4 py-2.5 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <Link to={data.kind === "private" ? "/my-access" : "/projects"}
            className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-surface-elevated px-3.5 py-1.5 text-xs font-bold hover:border-[color:var(--neon-cyan)] transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Exit Lab
          </Link>
          <h1 className="font-display text-sm md:text-base font-bold text-foreground truncate">{data.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {data.embed_type === "iframe" && data.external_url && (
            <a href={data.external_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface px-3 py-1.5 text-xs font-bold hover:border-[color:var(--neon-cyan)] transition-colors">
              <ExternalLink className="h-3 w-3" /> New Tab
            </a>
          )}
          {data.allow_fullscreen && (
            <button onClick={goFullscreen}
              className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--neon-cyan)]/40 bg-[color:var(--neon-cyan)]/10 text-[color:var(--neon-cyan)] px-3.5 py-1.5 text-xs font-bold hover:bg-[color:var(--neon-cyan)] hover:text-background transition-colors">
              <Maximize2 className="h-3 w-3" /> Fullscreen
            </button>
          )}
        </div>
      </header>

      <div className="relative flex-1 bg-background">
        {data.embed_type === "iframe" && data.external_url && !iframeFailed && (
          <iframe
            ref={frameRef}
            src={data.external_url}
            title={data.title}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
        {data.embed_type === "iframe" && iframeFailed && data.external_url && (
          <div className="absolute inset-0 flex items-center justify-center bg-background px-6">
            <div className="max-w-md text-center rounded-3xl border border-border/80 bg-surface/90 backdrop-blur-2xl p-8 shadow-card">
              <h2 className="font-display text-xl font-bold text-foreground">Launch in Standalone Tab</h2>
              <p className="mt-2 text-xs md:text-sm text-muted-foreground">This target application security policy requires opening in a dedicated browser tab.</p>
              <a href={data.external_url} target="_blank" rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full gradient-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-glow">
                Open in New Tab <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}
        {data.embed_type === "html" && (
          <iframe
            ref={frameRef}
            title={data.title}
            srcDoc={data.html_content ?? "<!doctype html><meta charset='utf-8'><body style='font-family:system-ui;padding:2rem;color:#888'>No HTML content yet.</body>"}
            sandbox="allow-scripts allow-forms allow-popups allow-modals allow-pointer-lock"
            className="absolute inset-0 h-full w-full border-0 bg-white"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
}