/**
 * Внутрішня утиліта для створення серверного клієнта Supabase.
 * Використовується виключно в шарі Infrastructure.
 */

import { createServerClient as createClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  let cookieStore;
  try {
    cookieStore = await cookies();
  } catch (error) {
    // Якщо cookies() недоступні (наприклад, під час статичної генерації),
    // ми створюємо клієнт без доступу до cookies.
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return []; },
          setAll() { },
        },
      },
    );
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Це може статися в Server Components, де не можна ставити cookies.
          }
        },
      },
    },
  );
}
