import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[640px] px-4 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">404</p>
      <h1 className="mt-2 font-[family-name:var(--font-oswald)] text-4xl uppercase">
        Page not found
      </h1>
      <p className="mt-3 text-sm text-[var(--muted)]">
        That route is not in the RAPPI SPORTS HUB catalog.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Back to catalog</Link>
      </Button>
    </div>
  );
}
