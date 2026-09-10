"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { useT } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const t = useT();
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
      aria-label={isLight ? t("theme.toDark") : t("theme.toLight")}
      title={isLight ? t("theme.dark") : t("theme.light")}
    >
      {ready ? (
        isLight ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />
      ) : (
        <span className="h-5 w-5" />
      )}
    </button>
  );
}
