"use server";

import { createServerClient } from "@/shared/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Ініціює процес автентифікації через Google OAuth.
 * Створює URL для редиректу в Google і перенаправляє користувача на нього.
 * @param formData - Дані форми. Не використовуються, але потрібні для сумісності з `formAction`.
 */
export async function signInWithGoogle(formData: FormData) {
  // Створюємо клієнт Supabase для серверних операцій.
  const supabase = await createServerClient();
  // Визначаємо URL, на який Google має повернути користувача.
  const origin = (await headers()).get("origin");
  const redirectUrl = formData.get("redirectUrl") as string | null;

  const callbackUrl = new URL(`${origin}/auth/callback`);
  if (redirectUrl) {
    callbackUrl.searchParams.set("next", redirectUrl);
  }

  // Викликаємо метод Supabase для входу через OAuth.
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      // Вказуємо URL для callback. Після успішної автентифікації
      // користувач буде перенаправлений на /auth/callback.
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    console.error("Помилка signInWithGoogle:", error);
    // В реальному додатку тут може бути редирект на сторінку з помилкою.
    return redirect("/login?error=Не вдалося ініціювати вхід через Google");
  }

  // Якщо URL для редиректу успішно створено, перенаправляємо користувача.
  if (data.url) {
    redirect(data.url);
  } else {
    // На випадок, якщо URL не було отримано, але й помилки не було.
    return redirect("/login?error=Не вдалося отримати URL для автентифікації");
  }
}

/**
 * Виконує вихід користувача з системи.
 */
export async function signOut() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
}
