"use client";

import { cn } from "@/lib/utils";

export function QtyStepper({
  value,
  min = 1,
  max,
  onChange,
  className,
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (next: number) => void;
  className?: string;
}) {
  const lo = Math.max(min, 1);
  const hi = Math.max(max, lo);

  return (
    <div
      className={cn(
        "inline-flex h-12 items-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-elevated)]",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= lo}
        onClick={() => onChange(Math.max(lo, value - 1))}
        className="flex h-12 w-12 items-center justify-center text-lg text-white transition-colors hover:text-[var(--accent)] disabled:text-[var(--muted-2)]"
      >
        −
      </button>
      <span className="price min-w-8 text-center text-sm font-semibold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= hi}
        onClick={() => onChange(Math.min(hi, value + 1))}
        className="flex h-12 w-12 items-center justify-center text-lg text-white transition-colors hover:text-[var(--accent)] disabled:text-[var(--muted-2)]"
      >
        +
      </button>
    </div>
  );
}
