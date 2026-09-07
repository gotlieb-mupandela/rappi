import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export { isSupabaseConfigured };

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
