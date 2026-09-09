import Link from "next/link";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel,
  className,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-2", className)}>
      <div>
        {eyebrow ? (
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-2)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-[family-name:var(--font-oswald)] text-2xl uppercase tracking-wide text-ink sm:text-3xl">
          {title}
        </h2>
      </div>
      {href && linkLabel ? (
        <Link
          href={href}
          className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)] transition-colors hover:text-[var(--accent-bright)]"
        >
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}
