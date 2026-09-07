"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { ProductVisual } from "@/components/product-visual";

export function ProductImage({
  product,
  src,
  alt,
  className,
  fallbackClassName,
}: {
  product: Product;
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
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
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
