"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { revalidateStorefront } from "@/app/admin/actions";
import { SpotlightPicker } from "@/components/admin/spotlight-picker";
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminContentPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tagline, setTagline] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroBody, setHeroBody] = useState("");
  const [spotlight, setSpotlight] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newBlurb, setNewBlurb] = useState("");

  async function loadCategories() {
    const supabase = createClient();
    const { data: cats } = await supabase.from("categories").select("*").order("sort_order");
    setCategories(cats ?? []);
  }

  useEffect(() => {
    const supabase = createClient();
    void (async () => {
      const [{ data: settings }] = await Promise.all([
        supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
        loadCategories(),
      ]);
      if (settings) {
        setTagline(settings.tagline);
        setHeroTitle(settings.hero_title);
        setHeroBody(settings.hero_body);
        setSpotlight(settings.spotlight_codes ?? []);
      }
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
      spotlight_codes: spotlight,
    });
    if (error) toast.error(error.message);
    else {
      await revalidateStorefront();
      toast.success("Homepage content saved");
    }
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
    else {
      await revalidateStorefront();
      toast.success(`${cat.name} updated`);
    }
  }

  async function moveCategory(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= categories.length) return;
    const reordered = [...categories];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    const next = reordered.map((row, i) => ({ ...row, sort_order: (i + 1) * 10 }));
    setCategories(next);
    const supabase = createClient();
    const results = await Promise.all(
      next.map((row) =>
        supabase.from("categories").update({ sort_order: row.sort_order }).eq("slug", row.slug),
      ),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) toast.error(failed.error.message);
    else await revalidateStorefront();
  }

  async function createCategory(e: FormEvent) {
    e.preventDefault();
    const slug = slugify(newSlug || newName);
    if (!slug || !newName.trim()) {
      toast.error("Name and slug are required");
      return;
    }
    const supabase = createClient();
    const maxOrder = categories.reduce((n, c) => Math.max(n, c.sort_order), 0);
    const { error } = await supabase.from("categories").insert({
      slug,
      name: newName.trim(),
      blurb: newBlurb.trim(),
      featured: false,
      sort_order: maxOrder + 10,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Category created");
      setNewName("");
      setNewSlug("");
      setNewBlurb("");
      await loadCategories();
      await revalidateStorefront();
    }
  }

  if (loading) return <p className="text-[var(--muted)]">Loading…</p>;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-oswald)] text-3xl uppercase sm:text-4xl">
          Content
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Homepage copy, spotlight products, and category hubs. New / Offer merchandising lives
          under Promotions.
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
        <SpotlightPicker codes={spotlight} onChange={setSpotlight} />
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
            className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 md:grid-cols-[auto_1fr_2fr_90px_auto_auto]"
          >
            <div className="flex gap-1">
              <Button type="button" size="sm" variant="ghost" onClick={() => void moveCategory(i, -1)}>
                ↑
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => void moveCategory(i, 1)}>
                ↓
              </Button>
            </div>
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
            <Input
              type="number"
              value={cat.sort_order}
              onChange={(e) => {
                const next = [...categories];
                next[i] = { ...cat, sort_order: Number(e.target.value) };
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
            <Button type="button" variant="outline" onClick={() => void saveCategory(categories[i])}>
              Save
            </Button>
          </div>
        ))}

        <form
          onSubmit={createCategory}
          className="space-y-3 rounded-xl border border-dashed border-[var(--border)] p-5"
        >
          <h3 className="text-sm font-bold uppercase tracking-wider">New category</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (!newSlug) setNewSlug(slugify(e.target.value));
                }}
                required
              />
            </label>
            <label className="space-y-1.5">
              <Label>Slug</Label>
              <Input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} required />
            </label>
            <label className="space-y-1.5">
              <Label>Blurb</Label>
              <Input value={newBlurb} onChange={(e) => setNewBlurb(e.target.value)} />
            </label>
          </div>
          <Button type="submit" variant="outline">
            Create category
          </Button>
        </form>
      </section>
    </div>
  );
}
