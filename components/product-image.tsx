"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { ProductVisual } from "@/components/product-visual";
import { productImageAlt } from "@/lib/copy";
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
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = Boolean(src) && failedSrc === src;

  if (!src || failed) {
    return (
      <ProductVisual product={product} className={fallbackClassName ?? className} />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? productImageAlt(product)}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      onError={() => setFailedSrc(src)}
    />
  );
}
