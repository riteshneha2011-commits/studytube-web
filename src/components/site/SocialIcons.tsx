import { useQuery } from "@tanstack/react-query";
import { Instagram, Youtube, Twitter, Facebook, Linkedin, Github, Globe, MessageCircle, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  x: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  github: Github,
  telegram: Send,
  whatsapp: MessageCircle,
};

export function useSocialLinks() {
  return useQuery({
    queryKey: ["social_links", "enabled"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .eq("enabled", true)
        .order("display_order");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function SocialIcons({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const { data } = useSocialLinks();
  const dim = size === "lg" ? "h-6 w-6" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const btn = size === "lg" ? "h-11 w-11" : size === "sm" ? "h-8 w-8" : "h-9 w-9";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {(data ?? []).map((s) => {
        const Icon = iconMap[s.icon?.toLowerCase()] ?? Globe;
        return (
          <a
            key={s.id}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.platform}
            className={cn(
              "inline-flex items-center justify-center rounded-full border border-border bg-surface text-foreground transition-all hover:border-primary hover:text-primary hover:-translate-y-0.5",
              btn,
            )}
          >
            <Icon className={dim} />
          </a>
        );
      })}
    </div>
  );
}