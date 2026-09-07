import Image from "next/image";
import { cn } from "@/lib/utils";

const SRC = {
  lockup: { src: "/brand/rappi-logo.png", width: 475, height: 385 },
  mark: { src: "/brand/rappi-mark.png", width: 236, height: 236 },
  banner: { src: "/brand/rappi-banner.png", width: 1024, height: 640 },
} as const;

export function BrandLogo({
  variant = "lockup",
  className,
  priority = false,
}: {
  variant?: keyof typeof SRC;
  className?: string;
  priority?: boolean;
}) {
  const img = SRC[variant];
  return (
    <Image
      src={img.src}
      alt="RAPPI SPORTS HUB"
      width={img.width}
      height={img.height}
      className={cn("brand-logo max-w-none object-contain", className)}
      style={variant === "mark" ? undefined : { width: "auto" }}
      sizes="200px"
      priority={priority}
    />
  );
}
