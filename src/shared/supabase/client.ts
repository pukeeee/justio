/**
 * Client-side Supabase client
 * Uses browser cookies for authentication
 */

import { createBrowserClient as createClient } from "@supabase/ssr";
import { type Database } from "@/shared/types/database";

export function createBrowserClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
