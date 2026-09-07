import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold tracking-[0.08em] uppercase transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:pointer-events-none disabled:opacity-40 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/70 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent)] text-[var(--on-accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] hover:bg-[var(--accent-bright)] hover:shadow-[0_10px_28px_rgba(182,255,0,0.18)]",
        outline:
          "border border-[var(--border-strong)] bg-transparent text-white hover:border-[var(--accent)] hover:text-[var(--accent)]",
        ghost: "text-white hover:bg-white/5 hover:text-[var(--accent)]",
        dark: "bg-white text-[#0B0B0B] hover:bg-[#E8E8E8]",
        danger: "border border-[var(--border-strong)] text-[var(--muted)] hover:text-white hover:border-white",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-7 text-[13px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
