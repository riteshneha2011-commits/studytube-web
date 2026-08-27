import { Link } from "@tanstack/react-router";
import { SocialIcons } from "./SocialIcons";

const links = [
  { to: "/projects", label: "Projects" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/auth", label: "Sign in" },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-surface/50">
      <div className="mx-auto max-w-6xl px-4 py-12 grid gap-8 md:grid-cols-3 md:items-start">
        <div className="text-sm text-muted-foreground text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <span className="inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-surface">
              <img src="/studytube-logo.png" alt="StudyTube logo" className="h-full w-full object-cover" />
            </span>
            <p className="font-display text-base text-foreground">
              StudyTube <span className="text-muted-foreground font-normal">by Ritesh Agarwal</span>
            </p>
          </div>
          <p className="mt-2 max-w-xs mx-auto md:mx-0 leading-relaxed">
            Educational apps for Class 9–12, JEE &amp; NEET — built by an IIT-trained teacher with 21+ years in the classroom.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col items-center md:items-end gap-4">
          <SocialIcons />
          <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} StudyTube</span>
        </div>
      </div>
    </footer>
  );
}
