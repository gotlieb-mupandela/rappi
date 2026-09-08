"use client";

import { useLocale } from "@/components/locale-provider";
import { MARKETS, MARKET_META, type Market } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ className }: { className?: string }) {
  const { market, setMarket, t } = useLocale();

  return (
    <div
      role="group"
      aria-label={t("locale.group")}
      className={cn(
        "flex h-11 shrink-0 items-center rounded-full border border-[var(--border)] p-0.5 text-[10px] font-semibold uppercase tracking-wider",
        className,
      )}
    >
      {MARKETS.map((id: Market) => {
        const active = market === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setMarket(id, "manual")}
            aria-pressed={active}
            aria-label={t(`locale.${id}`)}
            title={MARKET_META[id].label}
            className={cn(
              "h-10 whitespace-nowrap rounded-full px-2 transition-colors sm:px-3",
              active
                ? "bg-[var(--accent)] text-[var(--on-accent)]"
                : "text-ink hover:bg-[var(--hover)] hover:text-[var(--accent)]",
            )}
          >
            <span className="sm:hidden">{id === "na" ? "EN" : "FR"}</span>
            <span className="hidden sm:inline">{MARKET_META[id].switcher}</span>
          </button>
        );
      })}
    </div>
  );
}
