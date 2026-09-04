"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/types";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/catalog";

type AuthState = {
  user: User | null;
  login: (email: string, password: string) => { ok: boolean; message: string };
  logout: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (email, password) => {
        if (
          email.trim().toLowerCase() === DEMO_EMAIL &&
          password === DEMO_PASSWORD
        ) {
          set({
            user: { email: DEMO_EMAIL, name: "RAPPI Shop" },
          });
          return { ok: true, message: "Signed in." };
        }
        return { ok: false, message: "Use shop@rappi.com / rappi123." };
      },
      logout: () => set({ user: null }),
    }),
    { name: "rappi-auth", skipHydration: true },
  ),
);
