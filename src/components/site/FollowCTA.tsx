import { SocialIcons } from "./SocialIcons";
import { Sparkles, GraduationCap } from "lucide-react";

export function FollowCTA({
  headline = "Stay in the Learning Loop",
  sub = "Follow along for daily physics insights, new tool drops, and classroom experiments.",
}: {
  headline?: string;
  sub?: string;
}) {
  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <div className="relative overflow-hidden rounded-3xl border border-[color:var(--neon-cyan)]/35 bg-gradient-to-b from-[color:var(--surface)]/90 to-[color:var(--surface-elevated)]/90 backdrop-blur-2xl p-8 md:p-12 text-center shadow-card hover:border-[color:var(--neon-cyan)]/70 hover:shadow-glow-cyan transition-all duration-300">
        {/* Ambient background glow orb */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-[color:var(--neon-cyan)]/20 blur-3xl rounded-full pointer-events-none" />

        <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--neon-cyan)]/40 bg-[color:var(--neon-cyan)]/10 px-3.5 py-1 text-xs font-semibold text-[color:var(--neon-cyan)] mb-4">
          <GraduationCap className="h-3.5 w-3.5" />
          Community & Direct Updates
        </span>

        <h2 className="font-display text-2xl md:text-4xl font-bold tracking-tight text-foreground">
          {headline}
        </h2>
        <p className="mt-3 mx-auto max-w-lg text-sm md:text-base text-muted-foreground leading-relaxed">
          {sub}
        </p>

        <div className="mt-8 flex justify-center">
          <SocialIcons size="lg" />
        </div>
      </div>
    </section>
  );
}
