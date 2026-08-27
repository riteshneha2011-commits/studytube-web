import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { FollowCTA } from "@/components/site/FollowCTA";
import { GraduationCap, Target, Sparkles } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — StudyTube" },
      { name: "description", content: "IIT-trained, 21+ years of teaching, ex-Resonance Kota. Why these tools exist, how they're built, and what makes them different from generic edtech." },
      { property: "og:title", content: "About — StudyTube" },
      { property: "og:description", content: "Meet the teacher behind StudyTube: IIT-trained, 21+ years in the classroom, ex-Resonance Kota — building tools students actually use." },
      { property: "og:url", content: "https://studytube.co.in/about" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://studytube.co.in/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 pt-14 md:pt-20">
        <p className="text-xs uppercase tracking-widest text-primary">About</p>
        <h1 className="mt-2 font-display text-3xl md:text-5xl font-semibold tracking-tight">
          Tools built by a teacher, not a startup.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          21+ years in the classroom. IIT-trained. Years at Resonance Kota. Every app here started as
          something I wished existed while teaching — so I built it.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 grid gap-6 md:grid-cols-3">
        {[
          { icon: GraduationCap, title: "Why", body: "Kids don't need more content. They need better practice, cleaner explanations, and tools that respect their time." },
          { icon: Target, title: "What", body: "Small, focused apps for Class 9–12, JEE and NEET — practice portals, doubt-solving, 3D chemistry, physics simulations, memory games." },
          { icon: Sparkles, title: "How", body: "One idea, one app. Ship fast, listen, iterate. If it doesn't help a real student in a real week, it doesn't stay." },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl border border-border gradient-card p-6 shadow-card">
            <c.icon className="h-6 w-6 text-primary" />
            <h2 className="mt-3 font-display text-lg font-semibold">{c.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.body}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-12">
        <div className="rounded-2xl border border-border p-8 bg-surface/40">
          <h2 className="font-display text-xl font-semibold">A personal note</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Padhaai ka pressure real hai, but the goal isn't to memorise 200 formulas. The goal is to
            understand deeply, revise smartly, and enjoy the process. That's what these tools try to do —
            make the boring parts fast, so the interesting parts get your attention.
          </p>
        </div>
      </section>

      <FollowCTA />
      <div className="h-16" />
    </SiteLayout>
  );
}