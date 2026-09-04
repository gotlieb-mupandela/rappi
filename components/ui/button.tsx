import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold tracking-wide uppercase transition-colors disabled:pointer-events-none disabled:opacity-40 outline-none focus-visible:ring-2 focus-visible:ring-[#B6FF00]/60",
  {
    variants: {
      variant: {
        default:
          "bg-[#B6FF00] text-[#0B0B0B] hover:bg-[#C8FF00] shadow-[0_0_18px_rgba(182,255,0,0.25)]",
        outline:
          "border border-[#2A2A2A] bg-transparent text-white hover:border-[#B6FF00] hover:text-[#B6FF00]",
        ghost: "text-white hover:bg-[#1A1A1A] hover:text-[#B6FF00]",
        dark: "bg-white text-[#0B0B0B] hover:bg-[#E8E8E8]",
        danger: "border border-[#3A3A3A] text-[#A0A0A0] hover:text-white hover:border-white",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-7 text-base",
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
