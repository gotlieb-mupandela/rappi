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
        offset={24}
        toastOptions={{
          style: {
            background: "#141414",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
            borderRadius: "14px",
            boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
          },
        }}
      />
    </>
  );
}
