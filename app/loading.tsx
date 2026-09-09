export default function Loading() {
  return (
    <div className="page-shell flex min-h-[50vh] flex-col justify-center py-16">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
        GEAR UP. SHOW UP. LEVEL UP.
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-oswald)] text-4xl uppercase tracking-tight text-ink sm:text-5xl">
        RAPPI SPORTS HUB
      </h1>
      <p className="mt-4 text-sm text-[var(--muted)]">Loading storefront…</p>
    </div>
  );
}
