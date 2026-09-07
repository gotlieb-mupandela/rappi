import * as React from "react";
import { cn } from "@/lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
