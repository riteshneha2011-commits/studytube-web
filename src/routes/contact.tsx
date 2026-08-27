import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Loader2, Send, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — StudyTube" },
      { name: "description", content: "Get in touch with Ritesh Agarwal about StudyTube: collabs, institute inquiries, feature requests, feedback, or bug reports. Responses within a few days." },
      { property: "og:title", content: "Contact — StudyTube" },
      { property: "og:description", content: "Reach out about collabs, institute inquiries, feature requests or feedback — Ritesh replies within a few days." },
      { property: "og:url", content: "https://studytube.co.in/contact" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://studytube.co.in/contact" }],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  message: z.string().trim().min(5, "Message too short").max(2000),
});

function ContactPage() {
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
      message: fd.get("message"),
    });
    if (!parsed.success) { setErr(parsed.error.issues[0].message); return; }
    setState("loading");
    const payload = {
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
      phone: parsed.data.phone ? parsed.data.phone : null,
    };
    const { error } = await supabase.from("contact_submissions").insert(payload);
    if (error) { setErr(error.message); setState("idle"); return; }
    setState("success");
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-xl px-4 pt-14 md:pt-20 pb-16">
        <p className="text-xs uppercase tracking-widest text-primary">Contact</p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl font-semibold tracking-tight">Get in touch</h1>
        <p className="mt-3 text-muted-foreground">Collabs, institute inquiries, feature requests — all welcome.</p>

        {state === "success" ? (
          <div className="mt-8 rounded-2xl border border-primary/40 bg-primary/5 p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-3 font-display text-lg font-semibold">Message sent</p>
            <p className="mt-1 text-sm text-muted-foreground">I'll get back to you within a few days.</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <Field label="Your name" name="name" id="contact-name" />
            <Field label="Email" name="email" type="email" id="contact-email" />
            <Field label="Phone / Mobile (optional)" name="phone" type="tel" required={false} id="contact-phone" />
            <div>
              <label htmlFor="contact-message" className="text-sm font-medium">Message</label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                required
                className="mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                placeholder="Tell me a bit about what you need…"
              />
            </div>
            {err && <p className="text-sm text-destructive">{err}</p>}
            <button
              type="submit"
              disabled={state === "loading"}
              className="inline-flex items-center gap-2 rounded-full gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
            >
              {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send message
            </button>
          </form>
        )}
      </section>
    </SiteLayout>
  );
}

function Field({ label, name, type = "text", required = true, id }: { label: string; name: string; type?: string; required?: boolean; id: string }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        className="mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
      />
    </div>
  );
}