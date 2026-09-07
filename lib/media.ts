const STORAGE_ROOT = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images`
  : "";

export function productStorageUrls(id: string) {
  const root = `${STORAGE_ROOT}/${id}`;
  const images = [1, 2, 3, 4, 5].map(
    (n) => `${root}/${String(n).padStart(2, "0")}.webp`,
  );
  return { imageUrl: images[0], images };
}

export function withProductImages<T extends { id: string; imageUrl: string; images: string[] }>(
  product: T,
): T {
  if (!STORAGE_ROOT) return product;
  return { ...product, ...productStorageUrls(product.id) };
}
