"use client";

import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";
import { LocaleProvider } from "@/components/locale-provider";
import { useTheme } from "@/components/theme-provider";
import type { Market } from "@/lib/i18n/config";
import { useAuth } from "@/lib/stores/auth";
import { useCart } from "@/lib/stores/cart";
import { useOrders } from "@/lib/stores/orders";
import { useWishlist } from "@/lib/stores/wishlist";

export function Providers({
  children,
  initialMarket,
}: {
  children: ReactNode;
  initialMarket: Market;
}) {
  const { theme } = useTheme();

  useEffect(() => {
    useCart.persist.rehydrate();
    useAuth.persist.rehydrate();
    useOrders.persist.rehydrate();
    useWishlist.persist.rehydrate();
  }, []);

  return (
    <LocaleProvider initialMarket={initialMarket}>
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
    </LocaleProvider>
  );
}
