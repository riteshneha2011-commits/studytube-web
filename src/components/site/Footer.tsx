import { Link } from "@tanstack/react-router";
import { SocialIcons } from "./SocialIcons";
import { Sparkles, Terminal } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/projects", label: "Apps & Labs" },
  { to: "/about", label: "Teaching Journey" },
  { to: "/contact", label: "Contact & Collabs" },
  { to: "/auth", label: "Lab Login" },
] as const;

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-[color:var(--surface)]/70 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-12 grid gap-8 md:grid-cols-3 md:items-center">
        {/* Brand identity column */}
        <div className="text-sm text-muted-foreground text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <span className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl border border-[color:var(--neon-cyan)]/40 shadow-glow-cyan bg-surface">
              <img src="/studytube-logo.png" alt="StudyTube logo" className="h-full w-full object-cover" />
            </span>
            <div>
              <p className="font-display text-base font-bold text-foreground">
                Study<span className="text-gradient">Tube</span>
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">Interactive EdTech Lab</p>
            </div>
          </div>
          <p className="mt-3 max-w-xs mx-auto md:mx-0 text-xs text-muted-foreground leading-relaxed">
            Physics simulations, practice portals, and learning tools for Class 9–12, JEE & NEET. Built by Ritesh Agarwal (IIT-trained, 21+ years teaching).
          </p>
        </div>

        {/* Navigation Links */}
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-muted-foreground hover:text-[color:var(--neon-cyan)] transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Social & copyright */}
        <div className="flex flex-col items-center md:items-end gap-3">
          <SocialIcons size="sm" />
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Terminal className="h-3 w-3 text-[color:var(--neon-cyan)]" />
            <span>© {new Date().getFullYear()} StudyTube. 100% Free & Open.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
