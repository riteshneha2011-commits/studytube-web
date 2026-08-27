import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, GraduationCap, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProjectCard, type Project } from "@/components/site/ProjectCard";
import { FollowCTA } from "@/components/site/FollowCTA";
import { SocialIcons } from "@/components/site/SocialIcons";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudyTube — Educational Apps for JEE, NEET & CBSE" },
      { name: "description", content: "IIT-trained teacher with 21+ years of classroom experience. Explore practice apps, tools, simulations and games for Class 9–12, JEE and NEET." },
      { property: "og:title", content: "StudyTube — Educational Apps for JEE, NEET & CBSE" },
      { property: "og:description", content: "Practice apps, tools, simulations and games for Class 9–12, JEE and NEET — built by Ritesh Agarwal, an IIT-trained teacher with 21+ years of classroom experience." },
      { property: "og:url", content: "https://studytube.co.in/" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://studytube.co.in/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "StudyTube",
          url: "https://studytube.co.in/",
          founder: { "@type": "Person", name: "Ritesh Agarwal" },
          description: "Educational apps for Class 9–12, JEE and NEET built by an IIT-trained teacher with 21+ years of classroom experience.",
          contactPoint: { "@type": "ContactPoint", contactType: "customer support", url: "https://studytube.co.in/contact" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "StudyTube",
          url: "https://studytube.co.in/",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://studytube.co.in/projects?category={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: featured = [] } = useQuery({
    queryKey: ["projects", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "visible")
        .eq("featured", true)
        .order("display_order")
        .limit(3);
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10 gradient-hero" />
        <div className="absolute inset-0 -z-10 bg-grid" />
        <div className="mx-auto max-w-4xl px-4 pt-16 pb-16 md:pt-24 md:pb-24 text-center">
          <span className="animate-rise inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-card backdrop-blur">
            <GraduationCap className="h-3.5 w-3.5 text-primary" />
            IIT-trained · 21+ years teaching · ex-Resonance Kota
          </span>
          <h1 className="animate-rise mt-6 font-display text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]" style={{ animationDelay: "60ms" }}>
            Educational apps that <span className="text-gradient">actually get used.</span>
          </h1>
          <p className="animate-rise mt-5 mx-auto max-w-xl text-base md:text-lg text-muted-foreground" style={{ animationDelay: "120ms" }}>
            Practice, tools, simulations and games for Class 9–12, JEE & NEET — built by a teacher, not a startup.
          </p>
          <div className="animate-rise mt-8 flex flex-col sm:flex-row items-center justify-center gap-3" style={{ animationDelay: "180ms" }}>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-full gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
            >
              Explore all projects <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated px-6 py-3 text-sm font-semibold shadow-card hover:border-primary transition-colors"
            >
              About me
            </Link>
          </div>

          {/* Stats */}
          <dl className="animate-rise mt-12 grid grid-cols-3 gap-3 max-w-lg mx-auto" style={{ animationDelay: "240ms" }}>
            {[
              { v: "21+", l: "Years teaching" },
              { v: "IIT", l: "Trained" },
              { v: "9–12", l: "JEE · NEET · CBSE" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-border gradient-card px-3 py-4 shadow-card">
                <dt className="font-display text-xl md:text-2xl font-semibold text-gradient">{s.v}</dt>
                <dd className="mt-1 text-[11px] md:text-xs text-muted-foreground">{s.l}</dd>
              </div>
            ))}
          </dl>

          {/* Social strip */}
          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Follow along</p>
            <SocialIcons size="lg" />
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary flex items-center gap-1.5 font-semibold"><Sparkles className="h-3.5 w-3.5" /> Featured</p>
            <h2 className="mt-2 font-display text-2xl md:text-3xl font-semibold tracking-tight">Start here</h2>
            <p className="mt-2 text-sm text-muted-foreground">Hand-picked tools worth your first ten minutes.</p>
          </div>
          <Link to="/projects" className="shrink-0 text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => (
            <div key={p.id} className="animate-rise" style={{ animationDelay: `${i * 70}ms` }}>
              <ProjectCard project={p} />
            </div>
          ))}
        </div>
      </section>

      <FollowCTA />

      <div className="h-16" />

    </SiteLayout>
  );
}
