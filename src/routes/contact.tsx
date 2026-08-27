import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Loader2, Send, CheckCircle2, MessageSquare, Mail, Phone, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Collaboration — StudyTube" },
      { name: "description", content: "Get in touch with Ritesh Agarwal about StudyTube: institute collaborations, feedback, feature requests, or questions." },
      { property: "og:title", content: "Contact & Collaboration — StudyTube" },
      { property: "og:description", content: "Reach out to Ritesh Agarwal for collaborations, institute inquiries, or feedback." },
      { property: "og:url", content: "https://studytube.co.in/contact" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://studytube.co.in/contact" }],
  }),
  component: ContactPage,
});

const TOPICS = [
  "Institute Inquiry",
  "App Feedback / Idea",
  "Collaboration",
  "Student Question",
] as const;

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  topic: z.string().optional(),
  message: z.string().trim().min(5, "Message must be at least 5 characters").max(2000),
});

function ContactPage() {
  const [selectedTopic, setSelectedTopic] = useState<string>("Institute Inquiry");
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      phone: fd.get("phone") ?? "",
      topic: selectedTopic,
      message: fd.get("message"),
    });
    if (!parsed.success) {
      setErr(parsed.error.issues[0].message);
      return;
    }
    setState("loading");
    const payload = {
      name: parsed.data.name,
      email: parsed.data.email,
      message: `[Topic: ${selectedTopic}]\n${parsed.data.message}`,
      phone: parsed.data.phone ? parsed.data.phone : null,
    };
    const { error } = await supabase.from("contact_submissions").insert(payload);
    if (error) {
      setErr(error.message);
      setState("idle");
      return;
    }
    setState("success");
  }

  return (
    <SiteLayout>
      <section className="relative mx-auto max-w-2xl px-4 pt-14 md:pt-20 pb-16">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--neon-cyan)]/40 bg-[color:var(--neon-cyan)]/10 px-4 py-1.5 text-xs font-semibold text-[color:var(--neon-cyan)] shadow-glow-cyan">
            <Sparkles className="h-3.5 w-3.5" /> Direct Line
          </span>
          <h1 className="mt-4 font-display text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Get in touch with Ritesh Sir.
          </h1>
          <p className="mt-3 text-sm md:text-base text-muted-foreground">
            Collabs, smart-board game requests, institute deployments, or student feedback — all welcome.
          </p>
        </div>

        <div className="mt-10 rounded-3xl border border-border/70 bg-surface/70 backdrop-blur-2xl p-6 md:p-10 shadow-card">
          {state === "success" ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-[color:var(--neon-emerald)] animate-bounce" />
              <h2 className="mt-4 font-display text-2xl font-bold text-foreground">Message Sent Successfully!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Thank you for reaching out. Ritesh Sir will reply to your email within 1–2 days.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Topic Selectors */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  What is this regarding?
                </label>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTopic(t)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all",
                        selectedTopic === t
                          ? "border-[color:var(--neon-cyan)] bg-[color:var(--neon-cyan)]/15 text-[color:var(--neon-cyan)] shadow-glow-cyan"
                          : "border-border/80 bg-surface-elevated text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Email in 2 columns */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Name</label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    placeholder="Rahul Sharma"
                    className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/90 px-4 py-2.5 text-sm text-foreground focus:border-[color:var(--neon-cyan)] focus:ring-1 focus:ring-[color:var(--neon-cyan)] outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Email</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    placeholder="rahul@example.com"
                    className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/90 px-4 py-2.5 text-sm text-foreground focus:border-[color:var(--neon-cyan)] focus:ring-1 focus:ring-[color:var(--neon-cyan)] outline-none"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="contact-phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mobile / WhatsApp (Optional)</label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/90 px-4 py-2.5 text-sm text-foreground focus:border-[color:var(--neon-cyan)] focus:ring-1 focus:ring-[color:var(--neon-cyan)] outline-none"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="contact-message" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  required
                  placeholder="Tell me what you have in mind..."
                  className="mt-1.5 w-full rounded-xl border border-border/80 bg-background/90 px-4 py-2.5 text-sm text-foreground focus:border-[color:var(--neon-cyan)] focus:ring-1 focus:ring-[color:var(--neon-cyan)] outline-none"
                />
              </div>

              {err && <p className="text-xs text-[color:var(--destructive)] font-medium">{err}</p>}

              <button
                type="submit"
                disabled={state === "loading"}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full gradient-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-glow hover:opacity-95 disabled:opacity-60 transition-all"
              >
                {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send Message
              </button>
            </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}