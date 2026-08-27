import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, GraduationCap, Sparkles, Compass, Lightbulb, Zap, Award, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProjectCard, type Project } from "@/components/site/ProjectCard";
import { FollowCTA } from "@/components/site/FollowCTA";
import { HeroInteractiveLab } from "@/components/site/HeroInteractiveLab";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudyTube — Interactive Learning Lab for JEE, NEET & CBSE" },
      { name: "description", content: "IIT-trained teacher with 21+ years of classroom experience. Explore interactive physics simulations, chemistry 3D visualizers, practice portals, and memory games." },
      { property: "og:title", content: "StudyTube — Interactive Learning Lab for JEE, NEET & CBSE" },
      { property: "og:description", content: "Classroom Proven. Code Powered. Built by Ritesh Agarwal (IITian with 21+ years teaching experience)." },
      { property: "og:url", content: "https://studytube.co.in/" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://studytube.co.in/" }],
  }),
  component: Home,
});

function Home() {
  const { data: featured = [], isLoading } = useQuery({
    queryKey: ["projects", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "visible")
        .order("display_order")
        .limit(6);
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });

  return (
    <SiteLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
        {/* Background ambient lighting */}
        <div className="absolute inset-0 -z-10 gradient-hero" />
        <div className="absolute inset-0 -z-10 bg-grid" />

        <div className="mx-auto max-w-5xl px-4 text-center">
          {/* IIT Badge */}
          <div className="animate-rise inline-flex items-center gap-2 rounded-full border border-[color:var(--neon-cyan)]/40 bg-surface/90 px-4 py-1.5 text-xs font-semibold text-[color:var(--neon-cyan)] shadow-glow-cyan backdrop-blur-xl">
            <GraduationCap className="h-4 w-4" />
            <span>IIT-Trained · 21+ Years Classroom Experience · ex-Resonance Kota</span>
          </div>

          {/* Main Headline */}
          <h1 className="animate-rise mt-6 font-display text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05]" style={{ animationDelay: "60ms" }}>
            Classroom Proven. <br className="hidden sm:inline" />
            <span className="text-gradient">Code Powered.</span>
          </h1>

          {/* Subtitle */}
          <p className="animate-rise mt-5 mx-auto max-w-2xl text-base md:text-xl text-muted-foreground leading-relaxed" style={{ animationDelay: "120ms" }}>
            Interactive physics simulations, practice portals, 3D chemistry visualizers, and memory games for Class 9–12, JEE & NEET — built by an educator who knows where students get stuck.
          </p>

          {/* Hero CTAs */}
          <div className="animate-rise mt-8 flex flex-col sm:flex-row items-center justify-center gap-4" style={{ animationDelay: "180ms" }}>
            <Link
              to="/projects"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full gradient-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-glow hover:opacity-95 transition-transform hover:-translate-y-0.5"
            >
              <Compass className="h-4 w-4" /> Explore All Apps & Labs
            </Link>
            <Link
              to="/about"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-border/80 bg-surface/80 backdrop-blur px-8 py-3.5 text-sm font-bold text-foreground shadow-card hover:border-[color:var(--neon-cyan)] transition-colors"
            >
              My Teaching Journey <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Stats Bar */}
          <dl className="animate-rise mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto" style={{ animationDelay: "240ms" }}>
            {[
              { v: "21+", l: "Years in Classroom", icon: Flame, color: "text-[color:var(--neon-amber)]" },
              { v: "IITian", l: "Classroom Pedigree", icon: GraduationCap, color: "text-[color:var(--neon-cyan)]" },
              { v: "10+", l: "Interactive Tools", icon: Zap, color: "text-[color:var(--neon-emerald)]" },
              { v: "100%", l: "Free & Open to All", icon: Award, color: "text-[color:var(--neon-violet)]" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-border/60 bg-surface/70 backdrop-blur-xl p-4 shadow-card hover:border-primary/40 transition-colors text-left">
                <s.icon className={`h-4 w-4 ${s.color} mb-2`} />
                <dt className="font-display text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">{s.v}</dt>
                <dd className="mt-0.5 text-xs text-muted-foreground font-medium">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* The Live Interactive Labs Showcase Widget */}
        <HeroInteractiveLab />
      </section>

      {/* Featured Apps & Labs Section */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[color:var(--neon-cyan)] font-bold">
              <Sparkles className="h-3.5 w-3.5" /> Featured Lab Suite
            </span>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Hand-picked tools to accelerate your learning.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Zero fluff. Each app solves a specific learning friction: concept visualization, spaced memory retention, or exam speed.
            </p>
          </div>
          <Link
            to="/projects"
            className="shrink-0 text-sm font-bold text-[color:var(--neon-cyan)] hover:underline inline-flex items-center gap-1.5"
          >
            View all projects & filters <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-60 rounded-3xl border border-border bg-surface/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </section>

      {/* Educational Philosophy Bento Box */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-3xl border border-[color:var(--neon-violet)]/30 bg-surface/40 backdrop-blur-2xl p-8 md:p-12 shadow-card">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-widest text-[color:var(--neon-violet)] font-bold">Classroom Philosophy</span>
            <h2 className="mt-2 font-display text-2xl md:text-4xl font-bold tracking-tight">
              Why these tools feel different from generic EdTech.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-border/60 bg-surface-elevated/70 p-6">
              <div className="h-10 w-10 rounded-xl bg-[color:var(--neon-cyan)]/15 border border-[color:var(--neon-cyan)]/30 flex items-center justify-center text-[color:var(--neon-cyan)] mb-4">
                <Lightbulb className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground">Visual Intuition Over Rote Formula</h3>
              <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed">
                Formulas are forgotten; visual intuition lasts forever. Our 3D simulators let you experiment with variables until the physics becomes obvious.
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-surface-elevated/70 p-6">
              <div className="h-10 w-10 rounded-xl bg-[color:var(--neon-emerald)]/15 border border-[color:var(--neon-emerald)]/30 flex items-center justify-center text-[color:var(--neon-emerald)] mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground">Spaced Repetition & Speed Drills</h3>
              <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed">
                JEE & NEET require lightning fast pattern recognition. Flashcards and timed micro-quizzes automate revision intervals so you never blank out in exams.
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-surface-elevated/70 p-6">
              <div className="h-10 w-10 rounded-xl bg-[color:var(--neon-amber)]/15 border border-[color:var(--neon-amber)]/30 flex items-center justify-center text-[color:var(--neon-amber)] mb-4">
                <Flame className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground">21 Years Classroom Calibrated</h3>
              <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed">
                Every app was conceived in an actual classroom at Kota & Bhopal in response to real student questions and doubts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Follow CTA */}
      <FollowCTA />
      <div className="h-12" />
    </SiteLayout>
  );
}
