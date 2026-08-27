import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProjectCard, type Project } from "@/components/site/ProjectCard";
import { FollowCTA } from "@/components/site/FollowCTA";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

const searchSchema = z.object({
  category: z.enum(["All", "Practice", "Tools", "Simulations", "Games"]).optional().default("All"),
});

export const Route = createFileRoute("/projects")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Projects — StudyTube" },
      { name: "description", content: "Browse all educational apps: practice portals, tools, physics simulations, and memory games for Class 9–12, JEE and NEET." },
      { property: "og:title", content: "Projects — StudyTube" },
      { property: "og:description", content: "Practice, Tools, Simulations, Games — filter and explore." },
    ],
  }),
  component: ProjectsPage,
});

const cats = ["All", "Practice", "Tools", "Simulations", "Games"] as const;

function ProjectsPage() {
  const { category } = useSearch({ from: "/projects" });

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

  const filtered = category === "All" ? projects : projects.filter((p) => p.category === category);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 pt-12 md:pt-16 pb-6">
        <p className="text-xs uppercase tracking-widest text-primary">Projects</p>
        <h1 className="mt-2 font-display text-3xl md:text-5xl font-semibold tracking-tight">Every app, in one place.</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">Filter by what you need. Everything below is free to explore.</p>

        <div className="mt-8 flex flex-wrap gap-2">
          {cats.map((c) => (
            <Link
              key={c}
              to="/projects"
              search={{ category: c }}
              replace
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
                category === c
                  ? "gradient-primary text-primary-foreground border-transparent shadow-glow"
                  : "border-border bg-surface text-muted-foreground hover:text-foreground hover:border-primary/50",
              )}
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 rounded-2xl border border-border gradient-card animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            Nothing here yet in this category.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </section>

      <div className="py-12">
        <FollowCTA headline="Like what you see?" sub="Follow for updates whenever a new tool drops." />
      </div>
      <div className="h-16" />
    </SiteLayout>
  );
}