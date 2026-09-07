"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type Method = {
  id: string;
  name: string;
  cost: number;
  sort_order: number;
};

export default function AdminShippingPage() {
  const [methods, setMethods] = useState<Method[]>([]);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [cost, setCost] = useState("0");
  const [sortOrder, setSortOrder] = useState("10");

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("shipping_methods")
      .select("*")
      .order("sort_order");
    setMethods(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function saveRow(row: Method) {
    const supabase = createClient();
    const { error } = await supabase.from("shipping_methods").upsert(row);
    if (error) toast.error(error.message);
    else {
      toast.success("Shipping method saved");
      void load();
    }
  }

  async function remove(rowId: string) {
    if (!confirm(`Delete shipping method ${rowId}?`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("shipping_methods").delete().eq("id", rowId);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      void load();
    }
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    await saveRow({
      id: id.trim(),
      name: name.trim(),
      cost: Number(cost) || 0,
      sort_order: Number(sortOrder) || 0,
    });
    setId("");
    setName("");
    setCost("0");
  }

  if (loading) return <p className="text-[var(--muted)]">Loading…</p>;

  return (
    <div>
      <h1 className="font-[family-name:var(--font-oswald)] text-3xl uppercase sm:text-4xl">
        Shipping
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Methods used by <code className="text-[var(--accent)]">place_order</code> and checkout.
      </p>

      <div className="mt-8 space-y-3">
        {methods.map((m, i) => (
          <div
            key={m.id}
            className="grid gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 md:grid-cols-[120px_1fr_100px_80px_auto]"
          >
            <Input value={m.id} disabled />
            <Input
              value={m.name}
              onChange={(e) => {
                const next = [...methods];
                next[i] = { ...m, name: e.target.value };
                setMethods(next);
              }}
            />
            <Input
              type="number"
              step="0.01"
              value={m.cost}
              onChange={(e) => {
                const next = [...methods];
                next[i] = { ...m, cost: Number(e.target.value) };
                setMethods(next);
              }}
            />
            <Input
              type="number"
              value={m.sort_order}
              onChange={(e) => {
                const next = [...methods];
                next[i] = { ...m, sort_order: Number(e.target.value) };
                setMethods(next);
              }}
            />
            <div className="flex gap-2">
              <Button type="button" onClick={() => void saveRow(methods[i])}>
                Save
              </Button>
              <Button type="button" variant="ghost" onClick={() => void remove(m.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={onCreate}
        className="mt-10 space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
      >
        <h2 className="text-sm font-bold uppercase tracking-wider">Add method</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <label className="space-y-1.5">
            <Label>ID</Label>
            <Input value={id} onChange={(e) => setId(e.target.value)} required />
          </label>
          <label className="space-y-1.5 md:col-span-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="space-y-1.5">
            <Label>Cost (N$)</Label>
            <Input
              type="number"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </label>
        </div>
        <Button type="submit">Create</Button>
      </form>
    </div>
  );
}
