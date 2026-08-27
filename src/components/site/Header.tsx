import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SocialIcons } from "./SocialIcons";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home" },
  { to: "/projects", label: "Projects" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { session, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:py-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-border/60 shadow-glow bg-surface">
            <img src="/studytube-logo.png" alt="StudyTube logo" className="h-full w-full object-cover" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-lg font-semibold tracking-tight">
              Study<span className="text-gradient">Tube</span>
            </span>
            <span className="text-[10px] text-muted-foreground">by Ritesh Agarwal</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:text-foreground hover:bg-surface transition-colors"
              activeProps={{ className: "text-foreground bg-surface" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <SocialIcons size="sm" />
          <ThemeToggle />
          {session ? (
            <Link
              to={isAdmin ? "/admin" : "/my-access"}
              className="px-3 py-1.5 text-sm font-medium rounded-md bg-surface border border-border hover:border-primary transition-colors"
            >
              {isAdmin ? "Admin" : "My Access"}
            </Link>
          ) : null}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className={cn("md:hidden border-t border-border/60 overflow-hidden transition-all", open ? "max-h-96" : "max-h-0")}>
        <div className="px-4 py-4 flex flex-col gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 text-sm font-medium text-muted-foreground rounded-md hover:text-foreground hover:bg-surface"
              activeProps={{ className: "text-foreground bg-surface" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
          {session && (
            <Link
              to={isAdmin ? "/admin" : "/my-access"}
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 text-sm font-medium rounded-md bg-surface"
            >
              {isAdmin ? "Admin" : "My Access"}
            </Link>
          )}
          <div className="pt-3">
            <SocialIcons size="sm" />
          </div>
        </div>
      </div>
    </header>
  );
}