"use server";

/**
 * @file auth.actions.ts
 * @description Server Actions для автентифікації
 *
 * Покращення:
 * - Валідація вхідних даних
 * - Детальне логування
 * - Безпечні редіректи
 * - Правильна обробка помилок
 */

import { createServerClient } from "@/shared/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/**
 * Максимальна довжина redirect URL для безпеки
 */
const MAX_REDIRECT_LENGTH = 200;

/**
 * Валідує redirect URL
 */
function validateRedirectUrl(url: string | null): string | null {
  if (!url) return null;

  // Перевіряємо довжину
  if (url.length > MAX_REDIRECT_LENGTH) return null;

  // Перевіряємо, що це відносний шлях
  if (!url.startsWith("/")) return null;

  // Перевіряємо, що немає протоколу (захист від open redirect)
  if (url.includes("://")) return null;

  return url;
}

/**
 * Ініціює автентифікацію через Google OAuth
 */
export async function signInWithGoogle(formData: FormData) {
  try {
    const supabase = await createServerClient();
    const headersList = await headers();
    const origin = headersList.get("origin");

    if (!origin) {
      throw new Error("Не вдалося визначити origin");
    }

    // Отримуємо та валідуємо redirect URL
    const rawRedirectUrl = formData.get("redirectUrl") as string | null;
    const redirectUrl = validateRedirectUrl(rawRedirectUrl);

    // Формуємо callback URL
    const callbackUrl = new URL(`${origin}/auth/callback`);
    if (redirectUrl) {
      callbackUrl.searchParams.set("next", redirectUrl);
    }

    // Логування для debugging (тільки dev)
    if (process.env.NODE_ENV === "development") {
      console.log("[Auth Action] Google OAuth initiation:", {
        redirectUrl,
        callbackUrl: callbackUrl.toString(),
      });
    }

    // Викликаємо Supabase OAuth
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("[Auth Action] OAuth помилка:", error);
      redirect(
        `/?error=${encodeURIComponent("Не вдалося ініціювати вхід через Google")}`,
      );
    }

    if (!data.url) {
      console.error("[Auth Action] Відсутній OAuth URL");
      redirect(
        `/?error=${encodeURIComponent("Не вдалося отримати URL для автентифікації")}`,
      );
    }

    // Редірект на Google OAuth
    redirect(data.url);
  } catch (error) {
    console.error("[Auth Action] Критична помилка:", error);

    // Якщо це не redirect error від Next.js
    if (error instanceof Error && !error.message.includes("NEXT_REDIRECT")) {
      redirect(`/?error=${encodeURIComponent("Внутрішня помилка сервера")}`);
    }

    throw error;
  }
}

/**
 * Виконує вихід користувача з системи
 */
export async function signOut() {
  try {
    const supabase = await createServerClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("[Auth Action] Помилка виходу:", error);
      // Не кидаємо помилку, все одно очистимо сесію
    }

    // Очищаємо кеш для всього layout
    revalidatePath("/", "layout");
  } catch (error) {
    console.error("[Auth Action] Критична помилка при виході:", error);
  } finally {
    // Завжди редіректимо на головну, навіть якщо була помилка
    redirect("/");
  }
}

/**
 * Перевіряє наявність активної сесії (для серверних компонентів)
 */
export async function getSession() {
  try {
    const supabase = await createServerClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("[Auth Action] Помилка отримання сесії:", error);
      return null;
    }

    return session;
  } catch (error) {
    console.error("[Auth Action] Критична помилка отримання сесії:", error);
    return null;
  }
}

/**
 * Перевіряє та оновлює сесію (для періодичної перевірки)
 */
export async function refreshSession() {
  try {
    const supabase = await createServerClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.refreshSession();

    if (error) {
      console.error("[Auth Action] Помилка оновлення сесії:", error);
      return null;
    }

    return session;
  } catch (error) {
    console.error("[Auth Action] Критична помилка оновлення сесії:", error);
    return null;
  }
}
