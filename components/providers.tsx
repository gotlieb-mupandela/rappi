"use client";

import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";
import { useAuth } from "@/lib/stores/auth";
import { useCart } from "@/lib/stores/cart";
import { useOrders } from "@/lib/stores/orders";
import { useWishlist } from "@/lib/stores/wishlist";

export function Providers({ children }: { children: ReactNode }) {
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
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1A1A1A",
            border: "1px solid #2A2A2A",
            color: "#fff",
          },
        }}
      />
    </>
  );
}
