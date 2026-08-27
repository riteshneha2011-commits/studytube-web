import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Sparkles, Compass } from "lucide-react";
import { SocialIcons } from "./SocialIcons";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home" },
  { to: "/projects", label: "Apps & Labs" },
  { to: "/about", label: "About Journey" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { session, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-[color:var(--background)]/80 backdrop-blur-2xl transition-colors">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:py-4">
        {/* Brand Logo & Tag */}
        <Link to="/" className="flex items-center gap-3 group">
          <span className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[color:var(--neon-cyan)]/40 shadow-glow-cyan bg-surface transition-transform group-hover:scale-105">
            <img src="/studytube-logo.png" alt="StudyTube logo" className="h-full w-full object-cover" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-lg md:text-xl font-bold tracking-tight text-foreground flex items-center gap-1.5">
              Study<span className="text-gradient">Tube</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded-full border border-[color:var(--neon-cyan)]/40 bg-[color:var(--neon-cyan)]/10 text-[color:var(--neon-cyan)]">Lab</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">by Ritesh Agarwal · IITian</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full border border-border/60 bg-surface/50 backdrop-blur">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-4 py-1.5 text-xs font-semibold text-muted-foreground rounded-full hover:text-foreground hover:bg-surface-elevated transition-all"
              activeProps={{ className: "text-[color:var(--neon-cyan)] bg-[color:var(--neon-cyan)]/10 border border-[color:var(--neon-cyan)]/30 font-bold" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          <SocialIcons size="sm" />
          <ThemeToggle />
          {session ? (
            <Link
              to={isAdmin ? "/admin" : "/my-access"}
              className="px-4 py-2 text-xs font-semibold rounded-full gradient-primary text-primary-foreground shadow-glow hover:opacity-95 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {isAdmin ? "Admin Studio" : "My Lab Access"}
            </Link>
          ) : (
            <Link
              to="/projects"
              className="px-4 py-2 text-xs font-semibold rounded-full border border-[color:var(--neon-cyan)]/50 bg-[color:var(--neon-cyan)]/10 text-[color:var(--neon-cyan)] hover:bg-[color:var(--neon-cyan)] hover:text-background transition-all flex items-center gap-1.5 shadow-glow-cyan"
            >
              <Compass className="h-3.5 w-3.5" /> Explore Apps
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-foreground"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={cn("md:hidden border-t border-border/60 overflow-hidden transition-all bg-surface/95 backdrop-blur-xl", open ? "max-h-96" : "max-h-0")}>
        <div className="px-4 py-4 flex flex-col gap-1.5">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="px-4 py-2.5 text-sm font-semibold text-muted-foreground rounded-xl hover:text-foreground hover:bg-surface-elevated transition-colors"
              activeProps={{ className: "text-[color:var(--neon-cyan)] bg-[color:var(--neon-cyan)]/10 font-bold" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
          {session ? (
            <Link
              to={isAdmin ? "/admin" : "/my-access"}
              onClick={() => setOpen(false)}
              className="mt-2 px-4 py-2.5 text-sm font-semibold rounded-xl gradient-primary text-primary-foreground text-center"
            >
              {isAdmin ? "Admin Studio" : "My Lab Access"}
            </Link>
          ) : (
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="mt-2 px-4 py-2.5 text-sm font-semibold rounded-xl border border-[color:var(--neon-cyan)]/40 bg-[color:var(--neon-cyan)]/10 text-[color:var(--neon-cyan)] text-center"
            >
              Sign In
            </Link>
          )}
          <div className="pt-3 border-t border-border/40 mt-2 flex justify-center">
            <SocialIcons size="sm" />
          </div>
        </div>
      </div>
    </header>
  );
}