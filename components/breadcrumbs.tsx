"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useT } from "@/components/locale-provider";
import { audienceName, hubName } from "@/lib/i18n/labels";
import type { MessageVars } from "@/lib/i18n/translate";
import { cn } from "@/lib/utils";

export type Crumb = {
  href?: string;
  label?: string;
  key?: string;
  vars?: MessageVars;
  hub?: string;
  audience?: string;
};

function crumbLabel(
  item: Crumb,
  t: ReturnType<typeof useT>,
) {
  if (item.key) return t(item.key, item.vars);
  if (item.hub) return hubName(item.hub, t);
  if (item.audience) return audienceName(item.audience, t);
  return item.label ?? "";
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const t = useT();
  return (
    <div className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--muted)]">
      <Link
        href="/"
        className="inline-flex items-center gap-0.5 uppercase tracking-wider transition-colors hover:text-[var(--accent)]"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        {t("back")}
      </Link>
      <span className="text-[var(--border-strong)]">/</span>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        const label = crumbLabel(item, t);
        return (
          <span
            key={`${label}-${i}`}
            className={cn("items-center gap-2", last || items.length < 3 ? "flex" : "hidden sm:flex")}
          >
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-[var(--accent)]">
                {label}
              </Link>
            ) : (
              <span className="text-ink">{label}</span>
            )}
            {!last ? <span className="text-[var(--border-strong)]">/</span> : null}
          </span>
        );
      })}
    </div>
  );
}
