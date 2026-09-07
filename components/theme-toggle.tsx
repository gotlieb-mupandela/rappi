"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [ready, setReady] = useState(false);
  const isLight = theme === "light";

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-[var(--hover)] hover:text-[var(--accent)]",
        className,
      )}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Dark mode" : "Light mode"}
    >
      {ready ? (
        isLight ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />
      ) : (
        <span className="h-5 w-5" />
      )}
    </button>
  );
}
