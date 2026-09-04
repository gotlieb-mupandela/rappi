import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
  {
    variants: {
      variant: {
        new: "bg-[#B6FF00] text-[#0B0B0B]",
        offer: "bg-[#FF2D6A] text-white",
        muted: "bg-[#2A2A2A] text-[#A0A0A0]",
        stock: "bg-[#1A1A1A] text-[#B6FF00] border border-[#B6FF00]/40",
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
