import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Loader2, LogOut, Plus, Trash2, Check, X, Mail, Pencil } from "lucide-react";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60) || `item-${Math.random().toString(36).slice(2, 8)}`;
}

type EmbedType = "link" | "iframe" | "html";

function EmbedFields({
  embedType, setEmbedType,
  externalUrl, setExternalUrl,
  htmlContent, setHtmlContent,
}: {
  embedType: EmbedType;
  setEmbedType: (v: EmbedType) => void;
  externalUrl: string;
  setExternalUrl: (v: string) => void;
  htmlContent: string;
  setHtmlContent: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(["link", "iframe", "html"] as EmbedType[]).map((v) => (
          <button type="button" key={v} onClick={() => setEmbedType(v)}
            className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              embedType === v ? "gradient-primary text-primary-foreground border-transparent" : "border-border text-muted-foreground hover:border-primary/40")}>
            {v === "link" ? "Link (new tab)" : v === "iframe" ? "Embed URL" : "Paste HTML"}
          </button>
        ))}
      </div>
      {embedType !== "html" && (
        <input value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)}
          type="url" placeholder="https://…" className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
      )}
      {embedType === "iframe" && (
        <p className="text-[11px] text-muted-foreground">Some sites (YouTube, banks, etc.) refuse to embed. If it doesn't load, switch to Link.</p>
      )}
      {embedType === "html" && (
        <>
          <textarea value={htmlContent} onChange={(e) => setHtmlContent(e.target.value)}
            rows={10} spellCheck={false}
            placeholder={"<!doctype html>\n<html>…"}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs font-mono" />
          <p className="text-[11px] text-muted-foreground">Paste a complete HTML document. It runs in a sandboxed iframe — self-contained CSS/JS only.</p>
        </>
      )}
    </div>
  );
}

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — StudyTube" },
      { name: "description", content: "StudyTube admin dashboard: manage public projects, private apps, invited users, social links, and contact inbox submissions." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Tab = "projects" | "private" | "social" | "inbox";

function AdminPage() {
  const { session, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("projects");

  useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/auth", replace: true });
    else if (!isAdmin) navigate({ to: "/my-access", replace: true });
  }, [loading, session, isAdmin, navigate]);

  if (!session || !isAdmin) {
    return (
      <SiteLayout>
        <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </SiteLayout>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "projects", label: "Projects" },
    { id: "private", label: "Private Apps" },
    { id: "social", label: "Social Links" },
    { id: "inbox", label: "Inbox" },
  ];

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 pt-12 pb-16">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary">Admin</p>
            <h1 className="mt-2 font-display text-3xl md:text-4xl font-semibold tracking-tight">Dashboard</h1>
          </div>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/", replace: true }); }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm hover:border-primary"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>

        <div className="mt-8 flex flex-wrap gap-2 border-b border-border pb-2">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("px-4 py-2 rounded-full text-sm font-medium transition-colors",
                tab === t.id ? "gradient-primary text-primary-foreground shadow-glow" : "bg-surface text-muted-foreground hover:text-foreground")}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "projects" && <ProjectsAdmin />}
          {tab === "private" && <PrivateAdmin />}
          {tab === "social" && <SocialAdmin />}
          {tab === "inbox" && <InboxAdmin />}
        </div>
      </section>
    </SiteLayout>
  );
}

/* ---------------- Projects ---------------- */
function NewProjectForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"Practice" | "Tools" | "Simulations" | "Games">("Practice");
  const [embedType, setEmbedType] = useState<EmbedType>("link");
  const [externalUrl, setExternalUrl] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setSaving(true);
    const slug = slugify(title);
    const { error } = await supabase.from("projects").insert({
      title,
      description,
      category,
      slug,
      embed_type: embedType,
      external_url: embedType === "html" ? null : (externalUrl || null),
      html_content: embedType === "html" ? htmlContent : null,
      status: "visible",
    });
    setSaving(false);
    if (error) { setErr(error.message); return; }
    setTitle(""); setDescription(""); setExternalUrl(""); setHtmlContent(""); setOpen(false);
    onCreated();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
        <Plus className="h-4 w-4" /> Add project
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-border gradient-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">New project</p>
        <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground text-xs">Cancel</button>
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Project title"
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Short description"
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
      <select value={category} onChange={(e) => setCategory(e.target.value as typeof category)}
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm">
        {["Practice", "Tools", "Simulations", "Games"].map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <EmbedFields
        embedType={embedType} setEmbedType={setEmbedType}
        externalUrl={externalUrl} setExternalUrl={setExternalUrl}
        htmlContent={htmlContent} setHtmlContent={setHtmlContent}
      />
      {err && <p className="text-xs text-destructive">{err}</p>}
      <button disabled={saving} className="inline-flex items-center gap-1.5 rounded-full gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Create project
      </button>
    </form>
  );
}

function ProjectsAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<string | null>(null);
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").order("display_order");
      if (error) throw error;
      return data;
    },
  });

  async function toggle(id: string, patch: Partial<{ featured: boolean; is_coming_soon: boolean; status: "visible" | "hidden" }>) {
    await supabase.from("projects").update(patch).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "projects"] });
    qc.invalidateQueries({ queryKey: ["projects"] });
  }

  return (
    <div className="space-y-3">
      <NewProjectForm onCreated={() => qc.invalidateQueries({ queryKey: ["admin", "projects"] })} />
      {isLoading && <Skeleton />}
      {data.map((p) => (
        <div key={p.id} className="rounded-xl border border-border gradient-card p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-semibold truncate">{p.title}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary">{p.category}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground uppercase tracking-wide">{p.embed_type ?? "link"}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-1">/{p.slug}</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Toggle label="Featured" on={p.featured} onClick={() => toggle(p.id, { featured: !p.featured })} />
              <Toggle label="Coming Soon" on={p.is_coming_soon} onClick={() => toggle(p.id, { is_coming_soon: !p.is_coming_soon })} />
              <Toggle label="Visible" on={p.status === "visible"} onClick={() => toggle(p.id, { status: p.status === "visible" ? "hidden" : "visible" })} />
              <button onClick={() => setEditing(editing === p.id ? null : p.id)}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 border border-border hover:border-primary/40">
                <Pencil className="h-3 w-3" /> {editing === p.id ? "Close" : "Edit"}
              </button>
            </div>
          </div>
          {editing === p.id && (
            <ProjectEditor project={p} onDone={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["admin", "projects"] }); qc.invalidateQueries({ queryKey: ["projects"] }); }} />
          )}
        </div>
      ))}
    </div>
  );
}

function ProjectEditor({ project, onDone }: { project: { id: string; title: string; slug: string; embed_type: string | null; external_url: string | null; html_content: string | null }; onDone: () => void }) {
  const [slug, setSlug] = useState(project.slug ?? "");
  const [embedType, setEmbedType] = useState<EmbedType>(((project.embed_type as EmbedType) ?? "link"));
  const [externalUrl, setExternalUrl] = useState(project.external_url ?? "");
  const [htmlContent, setHtmlContent] = useState(project.html_content ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setErr(null); setSaving(true);
    const nextSlug = slugify(slug || project.title);
    const { error } = await supabase.from("projects").update({
      slug: nextSlug,
      embed_type: embedType,
      external_url: embedType === "html" ? null : (externalUrl || null),
      html_content: embedType === "html" ? htmlContent : null,
    }).eq("id", project.id);
    setSaving(false);
    if (error) { setErr(error.message); return; }
    onDone();
  }

  return (
    <div className="mt-4 border-t border-border pt-4 space-y-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground">Slug (URL)</label>
        <input value={slug} onChange={(e) => setSlug(e.target.value)} onBlur={(e) => setSlug(slugify(e.target.value))}
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-mono" />
        <p className="mt-1 text-[11px] text-muted-foreground">Opens at /app/{slugify(slug || project.title)}</p>
      </div>
      <EmbedFields
        embedType={embedType} setEmbedType={setEmbedType}
        externalUrl={externalUrl} setExternalUrl={setExternalUrl}
        htmlContent={htmlContent} setHtmlContent={setHtmlContent}
      />
      {err && <p className="text-xs text-destructive">{err}</p>}
      <div className="flex gap-2">
        <button onClick={save} disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-full gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Save
        </button>
        <a href={`/app/${slugify(slug || project.title)}`} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm hover:border-primary">Preview</a>
      </div>
    </div>
  );
}

function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 border transition-colors",
        on ? "bg-primary/15 border-primary/40 text-primary" : "border-border text-muted-foreground hover:border-primary/40")}>
      {on ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />} {label}
    </button>
  );
}

/* ---------------- Private Apps + Access ---------------- */
function PrivateAdmin() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);

  const { data: apps = [] } = useQuery({
    queryKey: ["admin", "private_apps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("private_apps")
        .select("id, app_url, project_id, slug, embed_type, html_content, projects(title)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["admin", "projects", "min"],
    queryFn: async () => (await supabase.from("projects").select("id, title").order("title")).data ?? [],
  });

  const { data: access = [] } = useQuery({
    queryKey: ["admin", "access", selected],
    enabled: !!selected,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_access").select("*")
        .eq("private_app_id", selected!)
        .order("granted_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const [mode, setMode] = useState<"existing" | "new">("new");
  const [existingProjectId, setExistingProjectId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState<"Practice" | "Tools" | "Simulations" | "Games">("Practice");
  const [newEmbed, setNewEmbed] = useState<EmbedType>("iframe");
  const [newUrl, setNewUrl] = useState("");
  const [newHtml, setNewHtml] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);

  async function createApp() {
    setCreateErr(null); setCreating(true);
    try {
      let project_id = existingProjectId;
      let baseTitle = "app";
      if (mode === "new") {
        if (!newTitle.trim()) { setCreateErr("Title required"); return; }
        baseTitle = newTitle.trim();
        const projectSlug = slugify(newTitle);
        const { data: created, error: projErr } = await supabase.from("projects").insert({
          title: newTitle.trim(),
          description: newDescription.trim(),
          category: newCategory,
          slug: projectSlug,
          embed_type: newEmbed,
          external_url: newEmbed === "html" ? null : (newUrl || null),
          html_content: newEmbed === "html" ? newHtml : null,
          status: "private",
        }).select("id").single();
        if (projErr) { setCreateErr(projErr.message); return; }
        project_id = created.id;
      } else {
        if (!project_id) { setCreateErr("Select a project"); return; }
        baseTitle = projects.find((p) => p.id === project_id)?.title ?? "app";
      }
      const slug = slugify(newSlug || baseTitle);
      const { error } = await supabase.from("private_apps").insert({
        project_id,
        slug,
        embed_type: newEmbed,
        app_url: newEmbed === "html" ? "" : newUrl,
        html_content: newEmbed === "html" ? newHtml : null,
      });
      if (error) { setCreateErr(error.message); return; }
      setNewTitle(""); setNewDescription(""); setNewUrl(""); setNewHtml(""); setNewSlug(""); setExistingProjectId("");
      qc.invalidateQueries({ queryKey: ["admin", "private_apps"] });
      qc.invalidateQueries({ queryKey: ["admin", "projects", "min"] });
      qc.invalidateQueries({ queryKey: ["admin", "projects"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
    } finally {
      setCreating(false);
    }
  }

  async function grant(fd: FormData) {
    if (!selected) return;
    const user_email = String(fd.get("email")).trim().toLowerCase();
    const expires_raw = String(fd.get("expires") || "");
    const expires_at = expires_raw ? new Date(expires_raw).toISOString() : null;
    await supabase.from("user_access").insert({ private_app_id: selected, user_email, expires_at, status: "active" });
    qc.invalidateQueries({ queryKey: ["admin", "access", selected] });
  }

  async function revoke(id: string) {
    await supabase.from("user_access").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "access", selected] });
  }

  async function removeApp(id: string) {
    if (!confirm("Delete this private app and all its access?")) return;
    await supabase.from("private_apps").delete().eq("id", id);
    if (selected === id) setSelected(null);
    qc.invalidateQueries({ queryKey: ["admin", "private_apps"] });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-4">
        <form onSubmit={(e) => { e.preventDefault(); createApp(); }}
          className="rounded-xl border border-border gradient-card p-4 space-y-3">
          <p className="text-sm font-semibold">Add private app</p>

          <div className="flex gap-2">
            {(["new", "existing"] as const).map((m) => (
              <button type="button" key={m} onClick={() => setMode(m)}
                className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  mode === m ? "gradient-primary text-primary-foreground border-transparent" : "border-border text-muted-foreground hover:border-primary/40")}>
                {m === "new" ? "New project" : "Existing project"}
              </button>
            ))}
          </div>

          {mode === "existing" ? (
            <select value={existingProjectId} onChange={(e) => setExistingProjectId(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm">
              <option value="">Select project…</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          ) : (
            <div className="space-y-2">
              <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Project name (e.g. Class 11 Full Physics)" className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
              <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={2}
                placeholder="Short description (shown to invited users)" className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value as typeof newCategory)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm">
                {["Practice", "Tools", "Simulations", "Games"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <p className="text-[11px] text-muted-foreground">Creates a private project — hidden from the public projects page. Only invited emails can access it.</p>
            </div>
          )}

          <input value={newSlug} onChange={(e) => setNewSlug(e.target.value)}
            placeholder="slug (optional)" className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-mono" />
          <EmbedFields
            embedType={newEmbed} setEmbedType={setNewEmbed}
            externalUrl={newUrl} setExternalUrl={setNewUrl}
            htmlContent={newHtml} setHtmlContent={setNewHtml}
          />
          {createErr && <p className="text-xs text-destructive">{createErr}</p>}
          <button disabled={creating} className="inline-flex items-center gap-1.5 rounded-full gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create
          </button>
        </form>


        <div className="space-y-2">
          {apps.map((a: { id: string; app_url: string; slug: string; embed_type: string | null; projects: { title: string } | null }) => (
            <button key={a.id} onClick={() => setSelected(a.id)}
              className={cn("w-full text-left rounded-xl border p-3 transition-colors",
                selected === a.id ? "border-primary bg-primary/10" : "border-border gradient-card hover:border-primary/40")}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{a.projects?.title ?? "Untitled"} <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground uppercase ml-1">{a.embed_type ?? "link"}</span></p>
                  <p className="text-xs text-muted-foreground truncate">/app/{a.slug}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeApp(a.id); }}
                  className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="h-4 w-4" /></button>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border gradient-card p-4">
        {!selected ? (
          <p className="text-sm text-muted-foreground">Select a private app to manage access.</p>
        ) : (
          <>
            <p className="text-sm font-semibold">Grant access</p>
            <form onSubmit={(e) => { e.preventDefault(); grant(new FormData(e.currentTarget)); e.currentTarget.reset(); }}
              className="mt-3 space-y-2">
              <input name="email" type="email" required placeholder="user@example.com"
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
              <input name="expires" type="datetime-local"
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
              <button className="inline-flex items-center gap-1.5 rounded-full gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                <Plus className="h-4 w-4" /> Grant
              </button>
            </form>

            <div className="mt-5 space-y-2">
              {access.length === 0 && <p className="text-xs text-muted-foreground">No users invited yet.</p>}
              {access.map((r) => {
                const expired = r.expires_at && new Date(r.expires_at).getTime() <= Date.now();
                return (
                  <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{r.user_email}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.expires_at
                          ? `${expired ? "Expired" : "Expires"} ${new Date(r.expires_at).toLocaleDateString()}`
                          : "No expiry"}
                      </p>
                    </div>
                    <button onClick={() => revoke(r.id)} className="text-muted-foreground hover:text-destructive p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- Social Links ---------------- */
function SocialAdmin() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const { data = [] } = useQuery({
    queryKey: ["admin", "social"],
    queryFn: async () => (await supabase.from("social_links").select("*").order("display_order")).data ?? [],
  });

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["admin", "social"] });
    qc.invalidateQueries({ queryKey: ["social_links", "enabled"] });
  }

  async function add(fd: FormData) {
    await supabase.from("social_links").insert({
      platform: String(fd.get("platform")),
      icon: String(fd.get("icon")).toLowerCase(),
      url: String(fd.get("url")),
      enabled: true,
    });
    invalidate();
  }

  async function saveEdit(id: string, patch: { platform: string; icon: string; url: string }) {
    await supabase.from("social_links").update({ ...patch, icon: patch.icon.toLowerCase() }).eq("id", id);
    setEditingId(null);
    invalidate();
  }

  async function toggle(id: string, enabled: boolean) {
    await supabase.from("social_links").update({ enabled }).eq("id", id);
    invalidate();
  }

  async function remove(id: string) {
    await supabase.from("social_links").delete().eq("id", id);
    invalidate();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={(e) => { e.preventDefault(); add(new FormData(e.currentTarget)); e.currentTarget.reset(); }}
        className="rounded-xl border border-border gradient-card p-4 space-y-3 h-fit">
        <p className="text-sm font-semibold">Add link</p>
        <input name="platform" placeholder="Instagram" required className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
        <input name="icon" placeholder="instagram (icon key: instagram, youtube, twitter, x, facebook, linkedin, github, telegram, whatsapp)" required className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
        <input name="url" type="url" placeholder="https://…" required className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
        <button className="inline-flex items-center gap-1.5 rounded-full gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> Add
        </button>
      </form>
      <div className="space-y-2">
        {data.map((s) => (
          <div key={s.id} className="rounded-xl border border-border gradient-card p-3">
            {editingId === s.id ? (
              <SocialEditRow social={s} onSave={(patch) => saveEdit(s.id, patch)} onCancel={() => setEditingId(null)} />
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{s.platform} <span className="text-[10px] text-muted-foreground ml-1 uppercase">{s.icon}</span></p>
                  <p className="text-xs text-muted-foreground truncate">{s.url}</p>
                </div>
                <Toggle label={s.enabled ? "On" : "Off"} on={s.enabled} onClick={() => toggle(s.id, !s.enabled)} />
                <button onClick={() => setEditingId(s.id)} className="text-muted-foreground hover:text-primary p-1" title="Edit">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => remove(s.id)} className="text-muted-foreground hover:text-destructive p-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialEditRow({ social, onSave, onCancel }: {
  social: { platform: string; icon: string; url: string };
  onSave: (patch: { platform: string; icon: string; url: string }) => void;
  onCancel: () => void;
}) {
  const [platform, setPlatform] = useState(social.platform);
  const [icon, setIcon] = useState(social.icon);
  const [url, setUrl] = useState(social.url);
  return (
    <div className="space-y-2">
      <input value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder="Platform" className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
      <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="icon key" className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
      <div className="flex gap-2">
        <button onClick={() => onSave({ platform, icon, url })}
          className="inline-flex items-center gap-1.5 rounded-full gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
          <Check className="h-3 w-3" /> Save
        </button>
        <button onClick={onCancel} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:border-primary">
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ---------------- Inbox ---------------- */
function InboxAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin", "contact"],
    queryFn: async () => (await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  async function markHandled(id: string, handled: boolean) {
    await supabase.from("contact_submissions").update({ handled }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin", "contact"] });
  }

  if (data.length === 0) return <p className="text-sm text-muted-foreground">No messages yet.</p>;

  return (
    <div className="space-y-3">
      {data.map((m) => (
        <div key={m.id} className={cn("rounded-xl border p-4", m.handled ? "border-border/60 opacity-70" : "border-border gradient-card")}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium">{m.name} <span className="text-muted-foreground text-sm font-normal">· {new Date(m.created_at).toLocaleString()}</span></p>
              <a href={`mailto:${m.email}`} className="text-xs text-primary inline-flex items-center gap-1 hover:underline">
                <Mail className="h-3 w-3" /> {m.email}
              </a>
              {m.phone && (
                <a href={`tel:${m.phone}`} className="ml-3 text-xs text-primary inline-flex items-center gap-1 hover:underline">
                  📞 {m.phone}
                </a>
              )}
            </div>
            <Toggle label={m.handled ? "Handled" : "Open"} on={m.handled} onClick={() => markHandled(m.id, !m.handled)} />
          </div>
          <p className="mt-3 text-sm whitespace-pre-wrap">{m.message}</p>
        </div>
      ))}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => <div key={i} className="h-20 rounded-xl border border-border gradient-card animate-pulse" />)}
    </div>
  );
}