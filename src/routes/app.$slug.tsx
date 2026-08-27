import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, ExternalLink, Maximize2, Loader2, Lock } from "lucide-react";

export const Route = createFileRoute("/app/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — StudyTube` },
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
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md text-center rounded-2xl border border-border gradient-card p-8">
          <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
          <h1 className="mt-3 font-display text-xl font-semibold">Not available</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This app doesn't exist, isn't published, or you don't have access.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Link to="/projects" className="rounded-full border border-border bg-surface px-4 py-2 text-sm hover:border-primary">Browse projects</Link>
            {!session && (
              <button onClick={() => navigate({ to: "/auth" })} className="rounded-full gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Sign in</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 'link' mode → don't render inline; show open-out card
  if (data.embed_type === "link") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md text-center rounded-2xl border border-border gradient-card p-8">
          <h1 className="font-display text-xl font-semibold">{data.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">This app opens in a new tab.</p>
          <div className="mt-5 flex justify-center gap-2">
            <Link to={data.kind === "private" ? "/my-access" : "/projects"} className="rounded-full border border-border bg-surface px-4 py-2 text-sm hover:border-primary">Back</Link>
            {data.external_url && (
              <a href={data.external_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                Open <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between gap-3 border-b border-border bg-surface/70 backdrop-blur px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <Link to={data.kind === "private" ? "/my-access" : "/projects"}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:border-primary">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
          <h1 className="font-display text-sm md:text-base font-semibold truncate">{data.title}</h1>
        </div>
        <div className="flex items-center gap-1.5">
          {data.embed_type === "iframe" && data.external_url && (
            <a href={data.external_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:border-primary">
              <ExternalLink className="h-3.5 w-3.5" /> Open
            </a>
          )}
          {data.allow_fullscreen && (
            <button onClick={goFullscreen}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:border-primary">
              <Maximize2 className="h-3.5 w-3.5" /> Fullscreen
            </button>
          )}
        </div>
      </header>

      <div className="relative flex-1 bg-white">
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
            <div className="max-w-md text-center rounded-2xl border border-border gradient-card p-8">
              <h2 className="font-display text-lg font-semibold">This site refused to embed</h2>
              <p className="mt-2 text-sm text-muted-foreground">The target uses X-Frame-Options that block embedding. Open it in a new tab instead.</p>
              <a href={data.external_url} target="_blank" rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                Open in new tab <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}
        {data.embed_type === "html" && (
          <iframe
            ref={frameRef}
            title={data.title}
            srcDoc={data.html_content ?? "<!doctype html><meta charset='utf-8'><body style='font-family:system-ui;padding:2rem;color:#555'>No HTML content yet.</body>"}
            sandbox="allow-scripts allow-forms allow-popups allow-modals allow-pointer-lock"
            className="absolute inset-0 h-full w-full border-0 bg-white"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
}