import { ArrowUpRight, Lock, PlayCircle, Atom, FlaskConical, Cpu, Gamepad2, Sparkles } from "lucide-react";
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

const categoryConfig: Record<string, {
  color: string;
  bg: string;
  border: string;
  glow: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
}> = {
  Practice: {
    color: "text-[color:var(--neon-emerald)]",
    bg: "bg-[color:var(--neon-emerald)]/10",
    border: "border-[color:var(--neon-emerald)]/35 group-hover:border-[color:var(--neon-emerald)]/80",
    glow: "group-hover:shadow-glow-emerald",
    icon: FlaskConical,
    tag: "Practice Portal",
  },
  Tools: {
    color: "text-[color:var(--neon-cyan)]",
    bg: "bg-[color:var(--neon-cyan)]/10",
    border: "border-[color:var(--neon-cyan)]/35 group-hover:border-[color:var(--neon-cyan)]/80",
    glow: "group-hover:shadow-glow-cyan",
    icon: Cpu,
    tag: "Learning Tool",
  },
  Simulations: {
    color: "text-[color:var(--neon-violet)]",
    bg: "bg-[color:var(--neon-violet)]/10",
    border: "border-[color:var(--neon-violet)]/35 group-hover:border-[color:var(--neon-violet)]/80",
    glow: "group-hover:shadow-glow-violet",
    icon: Atom,
    tag: "3D Simulation",
  },
  Games: {
    color: "text-[color:var(--neon-amber)]",
    bg: "bg-[color:var(--neon-amber)]/10",
    border: "border-[color:var(--neon-amber)]/35 group-hover:border-[color:var(--neon-amber)]/80",
    glow: "group-hover:shadow-glow-amber",
    icon: Gamepad2,
    tag: "Classroom Game",
  },
};

export function ProjectCard({ project }: { project: Project }) {
  const embed = (project.embed_type ?? "link") as "link" | "iframe" | "html";
  const hasContent = embed === "html" ? true : Boolean(project.external_url);
  const disabled = project.is_coming_soon || !hasContent;
  const opensInApp = embed === "iframe" || embed === "html";

  const config = categoryConfig[project.category] ?? {
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-border/60 group-hover:border-primary/60",
    glow: "group-hover:shadow-glow",
    icon: Sparkles,
    tag: "Educational App",
  };
  const CategoryIcon = config.icon;

  const inner = (
    <div className={cn(
      "group relative flex h-full min-h-[14rem] flex-col justify-between overflow-hidden rounded-3xl border bg-[color:var(--card)]/90 backdrop-blur-xl p-6 shadow-card transition-all duration-300 hover:-translate-y-1.5",
      config.border,
      config.glow
    )}>
      {/* Top Bar: Category Pill & Status Badge */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <span className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide",
            config.bg,
            config.color,
            "border-current/30"
          )}>
            <CategoryIcon className="h-3.5 w-3.5" />
            {project.category}
          </span>

          <span className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold",
            disabled ? "bg-muted text-muted-foreground" : "bg-primary/12 text-primary border border-primary/25"
          )}>
            {!disabled && <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--neon-cyan)] animate-pulse" />}
            {disabled ? "Coming Soon" : "Live App"}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="mt-4 font-display text-lg font-bold text-foreground leading-snug transition-colors group-hover:text-primary">
          {project.title}
        </h3>
        <p className="mt-2 text-xs md:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {project.description}
        </p>
      </div>

      {/* Card Action Footer */}
      <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground font-medium">
          {config.tag}
        </span>
        <div className={cn("inline-flex items-center gap-1.5 text-xs font-bold transition-all", config.color)}>
          {disabled ? (
            <span className="inline-flex items-center gap-1 text-muted-foreground"><Lock className="h-3.5 w-3.5" /> In Development</span>
          ) : opensInApp ? (
            <span className="inline-flex items-center gap-1.5">Launch in Lab <PlayCircle className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
          ) : (
            <span className="inline-flex items-center gap-1.5">Open App <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
          )}
        </div>
      </div>
    </div>
  );

  if (disabled) return <div className="cursor-not-allowed opacity-85">{inner}</div>;
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
