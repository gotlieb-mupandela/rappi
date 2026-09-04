import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full rounded-md border border-[#2A2A2A] bg-[#121212] px-3 text-sm text-white placeholder:text-[#6B6B6B] outline-none transition-colors focus:border-[#B6FF00] focus:ring-1 focus:ring-[#B6FF00]/40 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
