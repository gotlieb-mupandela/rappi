"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { sanitizeSearch } from "@/lib/admin/order-lines";

type Hit = {
  code: string;
  name: string;
  item: string;
  image_url: string;
};

export function SpotlightPicker({
  codes,
  onChange,
}: {
  codes: string[];
  onChange: (codes: string[]) => void;
}) {
  const [q, setQ] = useState("");
  const [fetchedHits, setFetchedHits] = useState<Hit[]>([]);
  const [details, setDetails] = useState<Record<string, Hit>>({});

  useEffect(() => {
    const missing = codes.filter((code) => !details[code]);
    if (!missing.length) return;
    const supabase = createClient();
    void supabase
      .from("products")
      .select("code, name, item, image_url")
      .in("code", missing)
      .then(({ data }) => {
        if (!data?.length) return;
        setDetails((prev) => {
          const next = { ...prev };
          for (const row of data) next[row.code] = row as Hit;
          return next;
        });
      });
  }, [codes, details]);

  useEffect(() => {
    const term = sanitizeSearch(q);
    if (term.length < 2) return;
    const supabase = createClient();
    const handle = window.setTimeout(() => {
      void supabase
        .from("products")
        .select("code, name, item, image_url")
        .or(`code.ilike.%${term}%,item.ilike.%${term}%,name.ilike.%${term}%`)
        .limit(8)
        .then(({ data }) => setFetchedHits((data ?? []) as Hit[]));
    }, 200);
    return () => window.clearTimeout(handle);
  }, [q]);

  const chosen = useMemo(() => new Set(codes), [codes]);
  const hits = sanitizeSearch(q).length < 2 ? [] : fetchedHits;
  const selected = codes.map(
    (code) => details[code] ?? { code, name: code, item: "", image_url: "" },
  );

  function add(hit: Hit) {
    if (chosen.has(hit.code)) return;
    setDetails((prev) => ({ ...prev, [hit.code]: hit }));
    onChange([...codes, hit.code]);
    setQ("");
    setFetchedHits([]);
  }

  function remove(code: string) {
    onChange(codes.filter((c) => c !== code));
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...codes];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <Label>Spotlight products</Label>
      <p className="text-xs text-[var(--muted)]">
        Search the catalog and pin SKUs for the homepage. Order is the display order.
      </p>
      <div className="flex flex-wrap gap-2">
        {selected.map((item, i) => (
          <div
            key={item.code}
            className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] py-1 pl-1 pr-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image_url || "/brand/rappi-logo.png"}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="max-w-[10rem] truncate text-xs">
              <span className="font-mono font-bold">{item.code}</span>
            </span>
            <button type="button" className="text-[var(--muted)]" onClick={() => move(i, -1)} aria-label="Move earlier">
              ↑
            </button>
            <button type="button" className="text-[var(--muted)]" onClick={() => move(i, 1)} aria-label="Move later">
              ↓
            </button>
            <button type="button" className="text-[var(--muted)]" onClick={() => remove(item.code)} aria-label="Remove">
              ×
            </button>
          </div>
        ))}
      </div>
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search code or name"
        autoComplete="off"
      />
      {hits.length > 0 ? (
        <ul className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]">
          {hits.map((hit) => (
            <li key={hit.code}>
              <button
                type="button"
                onClick={() => add(hit)}
                disabled={chosen.has(hit.code)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-[var(--hover)] disabled:opacity-40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hit.image_url || "/brand/rappi-logo.png"}
                  alt=""
                  className="h-10 w-10 rounded-lg object-cover"
                />
                <span>
                  <span className="block font-mono font-bold">{hit.code}</span>
                  <span className="block text-xs text-[var(--muted)]">{hit.item || hit.name}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
