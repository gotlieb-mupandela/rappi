"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type Category = {
  slug: string;
  name: string;
  blurb: string;
  featured: boolean;
  sort_order: number;
};

export default function AdminContentPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tagline, setTagline] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroBody, setHeroBody] = useState("");
  const [spotlight, setSpotlight] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const supabase = createClient();
    void (async () => {
      const [{ data: settings }, { data: cats }] = await Promise.all([
        supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
        supabase.from("categories").select("*").order("sort_order"),
      ]);
      if (settings) {
        setTagline(settings.tagline);
        setHeroTitle(settings.hero_title);
        setHeroBody(settings.hero_body);
        setSpotlight((settings.spotlight_codes ?? []).join(", "));
      }
      setCategories(cats ?? []);
      setLoading(false);
    })();
  }, []);

  async function saveSettings(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("site_settings").upsert({
      id: 1,
      tagline,
      hero_title: heroTitle,
      hero_body: heroBody,
      spotlight_codes: spotlight
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    if (error) toast.error(error.message);
    else toast.success("Homepage content saved");
    setSaving(false);
  }

  async function saveCategory(cat: Category) {
    const supabase = createClient();
    const { error } = await supabase
      .from("categories")
      .update({
        name: cat.name,
        blurb: cat.blurb,
        featured: cat.featured,
        sort_order: cat.sort_order,
      })
      .eq("slug", cat.slug);
    if (error) toast.error(error.message);
    else toast.success(`${cat.name} updated`);
  }

  if (loading) return <p className="text-[var(--muted)]">Loading…</p>;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-oswald)] text-3xl uppercase sm:text-4xl">
          Content
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Homepage copy, spotlight SKUs, and category hubs. Product New/Offer badges
          are edited on each product.
        </p>
      </div>

      <form
        onSubmit={saveSettings}
        className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
      >
        <h2 className="text-sm font-bold uppercase tracking-wider">Homepage</h2>
        <label className="block space-y-1.5">
          <Label>Tagline</Label>
          <Input value={tagline} onChange={(e) => setTagline(e.target.value)} />
        </label>
        <label className="block space-y-1.5">
          <Label>Hero title</Label>
          <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
        </label>
        <label className="block space-y-1.5">
          <Label>Hero body</Label>
          <textarea
            value={heroBody}
            onChange={(e) => setHeroBody(e.target.value)}
            className="h-28 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3 text-sm"
          />
        </label>
        <label className="block space-y-1.5">
          <Label>Spotlight SKU codes (comma-separated)</Label>
          <Input value={spotlight} onChange={(e) => setSpotlight(e.target.value)} />
        </label>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save homepage"}
        </Button>
      </form>

      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-oswald)] text-xl uppercase">
          Categories
        </h2>
        {categories.map((cat, i) => (
          <div
            key={cat.slug}
            className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 md:grid-cols-[1fr_2fr_auto_auto]"
          >
            <Input
              value={cat.name}
              onChange={(e) => {
                const next = [...categories];
                next[i] = { ...cat, name: e.target.value };
                setCategories(next);
              }}
            />
            <Input
              value={cat.blurb}
              onChange={(e) => {
                const next = [...categories];
                next[i] = { ...cat, blurb: e.target.value };
                setCategories(next);
              }}
            />
            <label className="inline-flex items-center gap-2 text-xs uppercase tracking-wider">
              <input
                type="checkbox"
                checked={cat.featured}
                onChange={(e) => {
                  const next = [...categories];
                  next[i] = { ...cat, featured: e.target.checked };
                  setCategories(next);
                }}
              />
              Featured
            </label>
            <Button type="button" variant="outline" onClick={() => void saveCategory(cat)}>
              Save
            </Button>
          </div>
        ))}
      </section>
    </div>
  );
}
