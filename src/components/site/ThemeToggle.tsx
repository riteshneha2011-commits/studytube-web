import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemeMode } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const options: { mode: ThemeMode; icon: typeof Sun; label: string }[] = [
  { mode: "light", icon: Sun, label: "Light theme" },
  { mode: "system", icon: Monitor, label: "System theme" },
  { mode: "dark", icon: Moon, label: "Dark theme" },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { mode, setMode } = useTheme();

  return (
    <div
      role="group"
      aria-label="Theme"
      className={cn("inline-flex items-center gap-0.5 rounded-full border border-border bg-surface/80 p-0.5", className)}
    >
      {options.map((o) => (
        <button
          key={o.mode}
          type="button"
          onClick={() => setMode(o.mode)}
          aria-label={o.label}
          aria-pressed={mode === o.mode}
          title={o.label}
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors",
            mode === o.mode
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
        >
          <o.icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
