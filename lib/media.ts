const STORAGE_ROOT = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images`
  : "";

function isRemoteUrl(url: string | undefined | null) {
  return Boolean(url && /^https?:\/\//i.test(url));
}

export function productPublicUrls(id: string) {
  const images = [1, 2, 3, 4, 5].map(
    (n) => `/products/${id}/${String(n).padStart(2, "0")}.webp`,
  );
  return { imageUrl: images[0], images };
}

export function productStorageUrls(id: string) {
  const root = `${STORAGE_ROOT}/${id}`;
  const images = [1, 2, 3, 4, 5].map(
    (n) => `${root}/${String(n).padStart(2, "0")}.webp`,
  );
  return { imageUrl: images[0], images };
}

/** Prefer real CDN/remote URLs already on the product; only invent local/storage paths as fallback. */
export function withProductImages<
  T extends { id: string; imageUrl: string; images: string[] },
>(product: T): T {
  const remoteImages = (product.images ?? []).filter(isRemoteUrl);
  const remotePrimary = isRemoteUrl(product.imageUrl)
    ? product.imageUrl
    : remoteImages[0];

  if (remotePrimary) {
    return {
      ...product,
      imageUrl: remotePrimary,
      images: remoteImages.length ? remoteImages : [remotePrimary],
    };
  }

  const local = productPublicUrls(product.id);
  if (process.env.NODE_ENV !== "production") {
    return { ...product, ...local };
  }
  if (!STORAGE_ROOT) return { ...product, ...local };
  return { ...product, ...productStorageUrls(product.id) };
}
