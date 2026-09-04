"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_EMAIL, DEMO_PASSWORD, TAGLINE } from "@/lib/catalog";
import { useAuth } from "@/lib/stores/auth";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const result = login(email, password);
    if (result.ok) {
      toast.success("Welcome back.");
      router.push("/account");
    } else {
      toast.error(result.message);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[1440px] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md border border-[#2A2A2A] bg-[#141414] p-5 sm:p-8">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#B6FF00]">{TAGLINE}</p>
        <h1 className="mt-2 font-[family-name:var(--font-oswald)] text-4xl uppercase">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-[#A0A0A0]">
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
          <Button type="submit" className="w-full" size="lg">
            Sign in
          </Button>
        </form>
        <p className="mt-4 text-xs text-[#6B6B6B]">
          Demo: {DEMO_EMAIL} / {DEMO_PASSWORD}
        </p>
        <Button asChild variant="outline" className="mt-6 w-full">
          <Link href="/">Continue as guest</Link>
        </Button>
      </div>
    </div>
  );
}
