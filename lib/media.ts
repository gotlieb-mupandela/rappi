import extraGalleryByCode from "@/data/ai-gallery-urls.json";

const STORAGE_ROOT = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images`
  : "";

const EXTRA_GALLERY = extraGalleryByCode as Record<string, string[]>;

function isRemoteUrl(url: string | undefined | null) {
  return Boolean(url && /^https?:\/\//i.test(url));
}

function extraGalleryUrls(product: { id: string; code?: string }) {
  const fromCode = product.code ? EXTRA_GALLERY[product.code] : undefined;
  const fromId = EXTRA_GALLERY[product.id];
  return [...(fromCode ?? []), ...(fromId ?? [])].filter(isRemoteUrl);
}

function mergeGallery(
  product: { id: string; code?: string },
  primary: string | undefined,
  images: string[],
) {
  const extras = extraGalleryUrls(product);
  const upgraded = [...images, ...extras]
    .filter(Boolean)
    .map(upgradeProductImageUrl);
  const first = primary ? upgradeProductImageUrl(primary) : upgraded[0];
  const merged = [...new Set([...(first ? [first] : []), ...upgraded])];
  if (first && merged[0] !== first) {
    return { imageUrl: first, images: [first, ...merged.filter((url) => url !== first)] };
  }
  return { imageUrl: first ?? "", images: merged };
}

/** Joma `_large.jpg` thumbs are ~30KB; the same path without `_large` is full-res. */
export function upgradeProductImageUrl(url: string) {
  return url.replace(/_large(?=\.(jpe?g|png|webp)(\?|$))/i, "");
}

function isUsableImageUrl(url: string | undefined | null): url is string {
  return Boolean(url && (isRemoteUrl(url) || url.startsWith("/")));
}

/**
 * Ordered photo URLs for a card/PDP. Primary first, then gallery extras.
 * Used so a failed Joma hotlink can fall through to Demandware / Storage copies
 * instead of the silhouette placeholder.
 */
export function productImageCandidates(
  product: { imageUrl?: string; images?: string[] },
  preferred?: string | null,
) {
  const urls = [preferred, product.imageUrl, ...(product.images ?? [])]
    .filter(isUsableImageUrl)
    .map(upgradeProductImageUrl);
  return [...new Set(urls)];
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
  T extends { id: string; imageUrl: string; images: string[]; code?: string },
>(product: T): T {
  const remoteImages = (product.images ?? []).filter(isRemoteUrl);
  const remotePrimary = isRemoteUrl(product.imageUrl)
    ? product.imageUrl
    : remoteImages[0];

  if (remotePrimary) {
    return {
      ...product,
      ...mergeGallery(
        product,
        remotePrimary,
        remoteImages.length ? remoteImages : [remotePrimary],
      ),
    };
  }

  const local =
    process.env.NODE_ENV !== "production" || !STORAGE_ROOT
      ? productPublicUrls(product.id)
      : productStorageUrls(product.id);
  return {
    ...product,
    ...mergeGallery(product, local.imageUrl, local.images),
  };
}
