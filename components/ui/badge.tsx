import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]",
  {
    variants: {
      variant: {
        new: "bg-[var(--accent)] text-[var(--on-accent)]",
        offer: "bg-[#FF2D6A] text-white",
        muted: "bg-white/[0.08] text-[var(--muted)]",
        stock: "bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--border-accent)]",
        low: "bg-[#2A1A00] text-[#FFB020] border border-[#FFB020]/40",
      },
    },
    defaultVariants: { variant: "muted" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
