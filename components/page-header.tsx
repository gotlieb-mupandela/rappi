import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/breadcrumbs";
import { cn } from "@/lib/utils";

export function PageHeader({
  crumbs,
  eyebrow,
  title,
  description,
  actions,
  media,
}: {
  crumbs?: Crumb[];
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  media?: ReactNode;
}) {
  return (
    <header className="border-b border-[var(--border)]">
      <div
        className={cn(
          "page-shell py-8 sm:py-10 lg:py-14",
          media &&
            "grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,24rem)] lg:gap-12",
        )}
      >
        <div className="min-w-0">
          {crumbs?.length ? <Breadcrumbs items={crumbs} /> : null}
          {eyebrow ? (
            <p
              className={cn(
                "text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]",
                crumbs?.length ? "mt-6" : "",
              )}
            >
              {eyebrow}
            </p>
          ) : null}
          <h1
            className={cn(
              "font-[family-name:var(--font-oswald)] text-4xl uppercase leading-[0.92] tracking-tight text-ink sm:text-5xl md:text-6xl",
              eyebrow || crumbs?.length ? "mt-3" : "",
            )}
          >
            {title}
          </h1>
          {description ? (
            <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted)] sm:text-base">
              {description}
            </p>
          ) : null}
          {actions ? (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {actions}
            </div>
          ) : null}
        </div>
        {media ? <div className="min-w-0">{media}</div> : null}
      </div>
    </header>
  );
}
