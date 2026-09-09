"use server";

import { revalidatePath, updateTag } from "next/cache";

export async function revalidateStorefront() {
  updateTag("site-settings");
  updateTag("product-badges");
  revalidatePath("/");
  revalidatePath("/promotions");
}
