"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_EMAIL, DEMO_PASSWORD, TAGLINE } from "@/lib/catalog";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth } from "@/lib/stores/auth";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (!error && data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", data.user.id)
          .maybeSingle();
        login(email, password, {
          email: profile?.email ?? data.user.email ?? email,
          name: profile?.full_name || data.user.email?.split("@")[0] || "RAPPI Shop",
        });
        toast.success("Welcome back.");
        setLoading(false);
        router.push("/account");
        return;
      }
      // Fall through to demo login if Auth user missing
    }

    const result = login(email, password);
    setLoading(false);
    if (result.ok) {
      toast.success("Welcome back.");
      router.push("/account");
    } else {
      toast.error(result.message);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[1440px] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--accent)]">{TAGLINE}</p>
        <h1 className="mt-2 font-[family-name:var(--font-oswald)] text-4xl uppercase">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Demo shop login. Guests can browse and check out without an account.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-4 text-xs text-[var(--muted-2)]">
          Demo: {DEMO_EMAIL} / {DEMO_PASSWORD}
        </p>
        <Button asChild variant="outline" className="mt-6 w-full">
          <Link href="/">Continue as guest</Link>
        </Button>
      </div>
    </div>
  );
}
