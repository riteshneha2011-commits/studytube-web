import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProjectCard, type Project } from "@/components/site/ProjectCard";
import { FollowCTA } from "@/components/site/FollowCTA";
import { cn } from "@/lib/utils";
import { Search, Compass, FlaskConical, Atom, Cpu, Gamepad2, Layers } from "lucide-react";

const searchSchema = z.object({
  category: z.enum(["All", "Practice", "Tools", "Simulations", "Games"]).optional().default("All"),
});

export const Route = createFileRoute("/projects")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Apps & Learning Labs — StudyTube" },
      { name: "description", content: "Explore educational practice portals, physics simulations, 3D chemistry tools, and smart classroom games for Class 9–12, JEE and NEET." },
      { property: "og:title", content: "Apps & Learning Labs — StudyTube" },
      { property: "og:description", content: "Interactive practice portals, 3D simulations, tools, and games." },
    ],
  }),
  component: ProjectsPage,
});

const CATEGORIES = [
  { id: "All", label: "All Labs", icon: Layers, color: "text-foreground", activeBorder: "border-[color:var(--neon-cyan)] bg-[color:var(--neon-cyan)]/15 text-[color:var(--neon-cyan)]" },
  { id: "Practice", label: "Practice", icon: FlaskConical, color: "text-[color:var(--neon-emerald)]", activeBorder: "border-[color:var(--neon-emerald)] bg-[color:var(--neon-emerald)]/15 text-[color:var(--neon-emerald)] shadow-glow-emerald" },
  { id: "Tools", label: "Tools", icon: Cpu, color: "text-[color:var(--neon-cyan)]", activeBorder: "border-[color:var(--neon-cyan)] bg-[color:var(--neon-cyan)]/15 text-[color:var(--neon-cyan)] shadow-glow-cyan" },
  { id: "Simulations", label: "Simulations", icon: Atom, color: "text-[color:var(--neon-violet)]", activeBorder: "border-[color:var(--neon-violet)] bg-[color:var(--neon-violet)]/15 text-[color:var(--neon-violet)] shadow-glow-violet" },
  { id: "Games", label: "Games", icon: Gamepad2, color: "text-[color:var(--neon-amber)]", activeBorder: "border-[color:var(--neon-amber)] bg-[color:var(--neon-amber)]/15 text-[color:var(--neon-amber)] shadow-glow-amber" },
] as const;

function ProjectsPage() {
  const { category } = useSearch({ from: "/projects" });
  const [searchTerm, setSearchTerm] = useState("");

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects", "visible"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "visible")
        .order("display_order");
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });

  const filteredByCategory = category === "All" ? projects : projects.filter((p) => p.category === category);
  const filtered = filteredByCategory.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return p.title.toLowerCase().includes(term) || p.description.toLowerCase().includes(term);
  });

  return (
    <SiteLayout>
      <section className="relative mx-auto max-w-6xl px-4 pt-12 md:pt-20 pb-8">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[color:var(--neon-cyan)]">
          <Compass className="h-4 w-4" /> The Complete Lab Catalog
        </span>
        <h1 className="mt-2 font-display text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
          Every app, simulation & tool in one place.
        </h1>
        <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-2xl">
          Everything below is 100% free and built for direct student engagement. Filter by subject or search by keyword.
        </p>

        {/* Filter bar & Search */}
        <div className="mt-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-border/50 pb-6">
          {/* Subject Pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const isSelected = category === c.id;
              const count = c.id === "All" ? projects.length : projects.filter((p) => p.category === c.id).length;

              return (
                <Link
                  key={c.id}
                  to="/projects"
                  search={{ category: c.id }}
                  replace
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold border transition-all inline-flex items-center gap-2",
                    isSelected
                      ? c.activeBorder
                      : "border-border/70 bg-surface/60 text-muted-foreground hover:text-foreground hover:border-primary/50"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{c.label}</span>
                  <span className="text-[10px] font-mono opacity-70">({count})</span>
                </Link>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search apps, topics, JEE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-border/80 bg-surface/70 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-[color:var(--neon-cyan)] focus:ring-1 focus:ring-[color:var(--neon-cyan)] outline-none"
            />
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-60 rounded-3xl border border-border bg-surface/50 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/80 bg-surface/30 p-12 text-center text-muted-foreground">
            <p className="font-display text-lg font-semibold text-foreground">No apps found</p>
            <p className="mt-1 text-sm">Try adjusting your search term or filter category.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </section>

      <FollowCTA />
      <div className="h-16" />
    </SiteLayout>
  );
}