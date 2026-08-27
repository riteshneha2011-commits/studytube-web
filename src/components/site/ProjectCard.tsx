import { ArrowUpRight, Lock, PlayCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export type Project = {
  id: string;
  title: string;
  description: string;
  category: string;
  external_url: string | null;
  is_coming_soon: boolean;
  thumbnail_url: string | null;
  slug?: string | null;
  embed_type?: "link" | "iframe" | "html" | null;
};

const catColor: Record<string, string> = {
  Practice: "bg-[color:var(--color-cat-practice)]/12 text-[color:var(--color-cat-practice)] border-[color:var(--color-cat-practice)]/35",
  Tools: "bg-[color:var(--color-cat-tools)]/12 text-[color:var(--color-cat-tools)] border-[color:var(--color-cat-tools)]/35",
  Simulations: "bg-[color:var(--color-cat-simulations)]/12 text-[color:var(--color-cat-simulations)] border-[color:var(--color-cat-simulations)]/35",
  Games: "bg-[color:var(--color-cat-games)]/12 text-[color:var(--color-cat-games)] border-[color:var(--color-cat-games)]/35",
};

const catAccent: Record<string, string> = {
  Practice: "bg-[color:var(--color-cat-practice)]",
  Tools: "bg-[color:var(--color-cat-tools)]",
  Simulations: "bg-[color:var(--color-cat-simulations)]",
  Games: "bg-[color:var(--color-cat-games)]",
};

export function ProjectCard({ project }: { project: Project }) {
  const embed = (project.embed_type ?? "link") as "link" | "iframe" | "html";
  const hasContent = embed === "html" ? true : Boolean(project.external_url);
  const disabled = project.is_coming_soon || !hasContent;
  const opensInApp = embed === "iframe" || embed === "html";

  const inner = (
    <div className="group relative flex h-full min-h-[13rem] flex-col overflow-hidden rounded-2xl border border-border gradient-card p-6 shadow-card transition-all duration-300 hover:border-primary/50 hover:-translate-y-1 hover:shadow-glow">
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-1 opacity-70 transition-opacity group-hover:opacity-100",
          catAccent[project.category] ?? "bg-primary",
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
            catColor[project.category] ?? "border-border text-muted-foreground",
          )}
        >
          {project.category}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            disabled ? "bg-muted text-muted-foreground" : "bg-primary/12 text-primary",
          )}
        >
          {disabled ? "Coming Soon" : "Live"}
        </span>
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold leading-snug transition-colors group-hover:text-primary">
        {project.title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-1">{project.description}</p>
      <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
        {disabled ? (
          <><Lock className="h-3.5 w-3.5" /> Coming soon</>
        ) : opensInApp ? (
          <>Launch <PlayCircle className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>
        ) : (
          <>Explore <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></>
        )}
      </div>
    </div>
  );

  if (disabled) return <div className="cursor-not-allowed opacity-90">{inner}</div>;
  if (opensInApp && project.slug) {
    return (
      <Link to="/app/$slug" params={{ slug: project.slug }} className="block h-full">
        {inner}
      </Link>
    );
  }
  return (
    <a href={project.external_url!} target="_blank" rel="noopener noreferrer" className="block h-full">
      {inner}
    </a>
  );
}
