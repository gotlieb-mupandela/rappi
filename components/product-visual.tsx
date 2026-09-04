import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

const PALETTE = [
  "#B6FF00",
  "#C8FF00",
  "#F5F5F5",
  "#1E6CFF",
  "#C4122F",
  "#0D8A62",
  "#FF6A00",
  "#9A9A9A",
  "#E85D04",
  "#4A90D9",
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function silhouette(category: string, item: string) {
  const i = item.toUpperCase();
  if (category === "shoes" || i.includes("SHOE") || i.includes("BOOT")) return "shoe";
  if (i.includes("BALL") && !i.includes("BAG")) return "ball";
  if (i.includes("BAG") || i.includes("BACKPACK")) return "bag";
  if (i.includes("GLOVE")) return "glove";
  if (i.includes("SHORT") || i.includes("SKIRT") || i.includes("DRESS")) return "bottom";
  if (i.includes("JACKET") || i.includes("HOOD") || i.includes("TRACK")) return "outer";
  if (i.includes("CAP") || i.includes("GOOG")) return "head";
  if (i.includes("MAT") || i.includes("TOWEL")) return "gear";
  return "tee";
}

export function ProductVisual({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const h = hash(product.code);
  const accent = PALETTE[h % PALETTE.length];
  const kind = silhouette(product.category, product.item);
  const initials = product.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden bg-[#161616]",
        className,
      )}
      style={{
        backgroundImage: `radial-gradient(120% 80% at 50% 20%, ${accent}22, transparent 55%), linear-gradient(180deg, #1C1C1C, #121212)`,
      }}
    >
      <svg
        viewBox="0 0 160 160"
        className="h-[72%] w-[72%] drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
        aria-hidden
      >
        {kind === "tee" && (
          <path
            d="M40 48 L28 40 L18 58 L40 70 L40 128 L120 128 L120 70 L142 58 L132 40 L120 48 L108 42 L52 42 Z"
            fill={accent}
            opacity="0.92"
          />
        )}
        {kind === "bottom" && (
          <path
            d="M50 36 H110 V52 L118 128 H92 L80 70 L68 128 H42 L50 52 Z"
            fill={accent}
            opacity="0.92"
          />
        )}
        {kind === "outer" && (
          <path
            d="M32 46 L18 58 L30 128 H64 V78 H96 V128 H130 L142 58 L128 46 L112 54 V42 H48 V54 Z"
            fill={accent}
            opacity="0.92"
          />
        )}
        {kind === "shoe" && (
          <path
            d="M24 96 C40 70, 70 62, 118 70 C136 74, 142 86, 138 98 C110 108, 70 112, 32 104 Z"
            fill={accent}
            opacity="0.95"
          />
        )}
        {kind === "ball" && (
          <circle cx="80" cy="80" r="42" fill={accent} opacity="0.95" />
        )}
        {kind === "bag" && (
          <path
            d="M52 58 H108 V122 H52 Z M64 58 V46 H96 V58"
            fill={accent}
            opacity="0.92"
          />
        )}
        {kind === "glove" && (
          <path
            d="M70 40 H90 V70 H110 V118 H50 V70 H70 Z"
            fill={accent}
            opacity="0.92"
          />
        )}
        {kind === "head" && (
          <path
            d="M40 88 C40 58, 120 58, 120 88 H40 Z M48 88 H112 V96 H48 Z"
            fill={accent}
            opacity="0.92"
          />
        )}
        {kind === "gear" && (
          <rect x="28" y="50" width="104" height="60" rx="4" fill={accent} opacity="0.9" />
        )}
      </svg>
      <span className="absolute bottom-2 right-2 font-mono text-[10px] tracking-widest text-white/35">
        {initials}
      </span>
    </div>
  );
}
