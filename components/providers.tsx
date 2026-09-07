"use client";

import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/lib/stores/auth";
import { useCart } from "@/lib/stores/cart";
import { useOrders } from "@/lib/stores/orders";
import { useWishlist } from "@/lib/stores/wishlist";

export function Providers({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  useEffect(() => {
    useCart.persist.rehydrate();
    useAuth.persist.rehydrate();
    useOrders.persist.rehydrate();
    useWishlist.persist.rehydrate();
  }, []);

  return (
    <>
      {children}
      <Toaster
        theme={theme}
        position="bottom-right"
        offset={24}
        toastOptions={{
          style: {
            background: "var(--toast-bg)",
            border: "1px solid var(--toast-border)",
            color: "var(--toast-fg)",
            borderRadius: "12px",
            boxShadow: "var(--shadow-soft)",
          },
        }}
      />
    </>
  );
}
