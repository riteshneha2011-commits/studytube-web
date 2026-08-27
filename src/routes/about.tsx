import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { FollowCTA } from "@/components/site/FollowCTA";
import { GraduationCap, Target, Sparkles, Code2, BookOpen, Compass, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Teaching Journey & Vision — StudyTube" },
      { name: "description", content: "IIT-trained teacher with 21+ years of classroom experience. Why these tools exist and how classroom experience translates into better learning apps." },
      { property: "og:title", content: "Teaching Journey & Vision — StudyTube" },
      { property: "og:description", content: "Meet Ritesh Agarwal: IITian, 21+ years teaching JEE & NEET physics, and creator of StudyTube." },
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
      {/* Hero Header */}
      <section className="relative mx-auto max-w-4xl px-4 pt-14 md:pt-24 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--neon-cyan)]/40 bg-[color:var(--neon-cyan)]/10 px-4 py-1.5 text-xs font-semibold text-[color:var(--neon-cyan)] shadow-glow-cyan">
          <GraduationCap className="h-4 w-4" />
          The Story Behind StudyTube
        </span>
        <h1 className="mt-6 font-display text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
          Tools built by a teacher, <br className="hidden sm:inline" />
          <span className="text-gradient">not a startup.</span>
        </h1>
        <p className="mt-5 text-base md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          21+ years in the classroom. IIT-trained. Years at Resonance Kota. Every app here started as something I wished existed while teaching — so I wrote the code myself.
        </p>
      </section>

      {/* 3 Core Pillars */}
      <section className="mx-auto max-w-5xl px-4 py-16 grid gap-6 md:grid-cols-3">
        {[
          {
            icon: BookOpen,
            color: "text-[color:var(--neon-cyan)] border-[color:var(--neon-cyan)]/30 bg-[color:var(--neon-cyan)]/10",
            title: "Why Build This?",
            body: "Students don't need another 500-page PDF. They need intuitive visual simulations, immediate feedback on problem-solving, and tools that respect their study time.",
          },
          {
            icon: Code2,
            color: "text-[color:var(--neon-emerald)] border-[color:var(--neon-emerald)]/30 bg-[color:var(--neon-emerald)]/10",
            title: "What We Build",
            body: "Laser-focused learning utilities: 3D chemistry visualizers, harmonic motion simulators, spaced repetition portals, and interactive smart board games.",
          },
          {
            icon: Sparkles,
            color: "text-[color:var(--neon-violet)] border-[color:var(--neon-violet)]/30 bg-[color:var(--neon-violet)]/10",
            title: "Classroom Iteration",
            body: "One concept, one app. Built, tested in real classrooms with real students, and continuously refined until the friction disappears.",
          },
        ].map((c) => (
          <div key={c.title} className="rounded-3xl border border-border/60 bg-surface/70 backdrop-blur-xl p-8 shadow-card hover:border-primary/40 transition-colors">
            <span className={`inline-flex h-12 w-12 rounded-2xl border items-center justify-center ${c.color} mb-6`}>
              <c.icon className="h-6 w-6" />
            </span>
            <h2 className="font-display text-xl font-bold text-foreground">{c.title}</h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{c.body}</p>
          </div>
        ))}
      </section>

      {/* Personal Note Box */}
      <section className="mx-auto max-w-4xl px-4 pb-16">
        <div className="rounded-3xl border border-[color:var(--neon-cyan)]/35 bg-surface/50 backdrop-blur-2xl p-8 md:p-12 shadow-card">
          <span className="text-xs uppercase font-mono text-[color:var(--neon-cyan)] tracking-wider font-bold">Personal Note</span>
          <h2 className="mt-2 font-display text-2xl md:text-3xl font-bold text-foreground">Padhaai ka pressure is real, but understanding should be effortless.</h2>
          <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
            In 21+ years of guiding students for JEE, NEET, and CBSE, I have seen that fear of complex topics dissolves the moment a student can see and touch the concept. The goal isn't rote memorization; it's deep intuition and confidence.
          </p>
          <div className="mt-8 pt-6 border-t border-border/50 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-display font-bold text-foreground">Ritesh Agarwal</p>
              <p className="text-xs text-muted-foreground">IIT-trained Teacher & Creator of StudyTube</p>
            </div>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-full gradient-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-glow"
            >
              <Compass className="h-4 w-4" /> Explore Interactive Apps
            </Link>
          </div>
        </div>
      </section>

      <FollowCTA />
      <div className="h-16" />
    </SiteLayout>
  );
}