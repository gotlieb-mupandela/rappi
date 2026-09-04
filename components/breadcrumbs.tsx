import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export type Crumb = { href?: string; label: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#A0A0A0]">
      <Link
        href="/"
        className="inline-flex items-center gap-0.5 uppercase tracking-wider hover:text-[#B6FF00]"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Back
      </Link>
      <span className="text-[#3A3A3A]">/</span>
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-2">
          {item.href ? (
            <Link href={item.href} className="hover:text-[#B6FF00]">
              {item.label}
            </Link>
          ) : (
            <span className="text-white">{item.label}</span>
          )}
          {i < items.length - 1 ? <span className="text-[#3A3A3A]">/</span> : null}
        </span>
      ))}
    </div>
  );
}
