import { SocialIcons } from "./SocialIcons";

export function FollowCTA({
  headline = "Follow along for daily tips",
  sub = "New drops, mini-lessons, and behind-the-build clips on Instagram & YouTube.",
}: { headline?: string; sub?: string }) {
  return (
    <section className="mx-auto max-w-4xl px-4">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface-elevated p-8 md:p-12 text-center shadow-card">
        <div className="absolute inset-0 -z-10 gradient-hero" />
        <span aria-hidden className="absolute inset-x-0 top-0 h-1 gradient-primary" />
        <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">{headline}</h2>
        <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-lg mx-auto">{sub}</p>
        <div className="mt-7 flex justify-center">
          <SocialIcons size="lg" />
        </div>
      </div>
    </section>
  );
}
