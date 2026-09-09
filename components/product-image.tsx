"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { ProductVisual } from "@/components/product-visual";
import { productImageAlt } from "@/lib/copy";
import { productImageCandidates } from "@/lib/media";

const RETRIES_PER_URL = 1;

type LoadState = {
  key: string;
  index: number;
  attempt: number;
};

export function ProductImage({
  product,
  src,
  alt,
  className,
  fallbackClassName,
  priority = false,
  sizes,
  fill = false,
}: {
  product: Product;
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
}) {
  const candidates = productImageCandidates(product, src);
  const sourceKey = candidates[0] ?? "";
  const [load, setLoad] = useState<LoadState>({
    key: sourceKey,
    index: 0,
    attempt: 0,
  });

  if (load.key !== sourceKey) {
    setLoad({ key: sourceKey, index: 0, attempt: 0 });
  }

  const current = candidates[load.key === sourceKey ? load.index : 0];

  if (!current) {
    return (
      <ProductVisual product={product} className={fallbackClassName ?? className} />
    );
  }

  const altText = alt ?? productImageAlt(product);
  const common = {
    src: current,
    className,
    sizes:
      sizes ??
      (priority
        ? "(max-width: 768px) 100vw, 42vw"
        : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"),
    priority,
    loading: (priority ? "eager" : "lazy") as "eager" | "lazy",
    referrerPolicy: "no-referrer" as const,
    onError: () => {
      setLoad((prev) => {
        if (prev.key !== sourceKey) {
          return { key: sourceKey, index: 0, attempt: 0 };
        }
        if (prev.attempt < RETRIES_PER_URL) {
          return { ...prev, attempt: prev.attempt + 1 };
        }
        return { ...prev, index: prev.index + 1, attempt: 0 };
      });
    },
  };

  if (fill) {
    return <Image key={`${current}:${load.attempt}`} fill alt={altText} {...common} />;
  }

  return (
    <Image
      key={`${current}:${load.attempt}`}
      width={900}
      height={1200}
      alt={altText}
      {...common}
    />
  );
}
