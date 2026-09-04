"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishState = {
  codes: string[];
  toggle: (code: string) => void;
  has: (code: string) => boolean;
};

export const useWishlist = create<WishState>()(
  persist(
    (set, get) => ({
      codes: [],
      toggle: (code) => {
        const has = get().codes.includes(code);
        set({
          codes: has
            ? get().codes.filter((c) => c !== code)
            : [...get().codes, code],
        });
      },
      has: (code) => get().codes.includes(code),
    }),
    { name: "rappi-wish", skipHydration: true },
  ),
);
