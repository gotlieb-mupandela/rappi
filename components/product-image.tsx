"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { ProductVisual } from "@/components/product-visual";
import { cn } from "@/lib/utils";

export function ProductImage({
  product,
  src,
  alt,
  className,
  fallbackClassName,
  priority = false,
}: {
  product: Product;
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <ProductVisual product={product} className={fallbackClassName ?? className} />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? product.code}
      className={cn("img-in", className)}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      onError={() => setFailed(true)}
    />
  );
}
