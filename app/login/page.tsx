"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/catalog";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuth } from "@/lib/stores/auth";
import { useT } from "@/components/locale-provider";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const t = useT();
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
        toast.success(t("login.welcome"));
        setLoading(false);
        router.push("/account");
        return;
      }
      // Fall through to demo login if Auth user missing
    }

    const result = login(email, password);
    setLoading(false);
    if (result.ok) {
      toast.success(t("login.welcome"));
      router.push("/account");
    } else {
      toast.error(t("login.invalid"));
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[1440px] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <BrandLogo className="mx-auto mb-5 h-28 w-auto" />
        <p className="text-center text-[11px] uppercase tracking-[0.22em] text-[var(--accent)]">{t("home.tagline")}</p>
        <h1 className="mt-2 font-[family-name:var(--font-oswald)] text-4xl uppercase">
          {t("login.title")}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {t("login.hint")}
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">{t("login.email")}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">{t("login.password")}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? t("login.signingIn") : t("login.submit")}
          </Button>
        </form>
        <p className="mt-4 text-xs text-[var(--muted-2)]">
          {t("login.demo", { email: DEMO_EMAIL, password: DEMO_PASSWORD })}
        </p>
        <Button asChild variant="outline" className="mt-6 w-full">
          <Link href="/">{t("login.guest")}</Link>
        </Button>
      </div>
    </div>
  );
}
