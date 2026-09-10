"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DPO_TEST_AMOUNT } from "@/lib/dpo-constants";
import { formatPrice } from "@/lib/format";

export function DpoTestForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/payments/dpo/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = (await res.json()) as { paymentUrl?: string; error?: string };
      if (!res.ok || !data.paymentUrl) {
        toast.error(data.error ?? "Could not start DPO payment.");
        return;
      }
      window.location.href = data.paymentUrl;
    } catch {
      toast.error("Could not start DPO payment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div>
        <Label htmlFor="dpo-name">Full name</Label>
        <Input
          id="dpo-name"
          className="mt-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />
      </div>
      <div>
        <Label htmlFor="dpo-email">Email</Label>
        <Input
          id="dpo-email"
          className="mt-2"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Starting DPO…" : `Pay ${formatPrice(DPO_TEST_AMOUNT)} with DPO`}
      </Button>
    </form>
  );
}
