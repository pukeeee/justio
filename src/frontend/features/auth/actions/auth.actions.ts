"use server";

/**
 * @file auth.actions.ts
 * @description Server Actions для автентифікації
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { container } from "@/backend/infrastructure/di/container";
import { IAuthService } from "@/backend/application/interfaces/services/auth.service.interface";
import { IAuthorizationService } from "@/backend/application/interfaces/services/authorization.service.interface";
import { getCachedUser } from "@/frontend/shared/lib/auth/get-user-data";

/**
 * Отримує роль користувача у воркспейсі за ID
 */
export async function getUserRoleAction(workspaceId: string) {
  try {
    const user = await getCachedUser();
    if (!user) return null;

    const authService = container.resolve<IAuthorizationService>(
      "IAuthorizationService",
    );
    const role = await authService.getUserRole(user.id, workspaceId);

    return role ? role.name : null;
  } catch (error) {
    console.error("[Auth Action] Помилка отримання ролі за ID:", error);
    return null;
  }
}

/**
 * Отримує роль користувача у воркспейсі за слагом
 */
export async function getUserRoleBySlugAction(slug: string) {
  try {
    const user = await getCachedUser();
    if (!user) return null;

    const authService = container.resolve<IAuthorizationService>(
      "IAuthorizationService",
    );
    const role = await authService.getUserRoleBySlug(user.id, slug);

    return role ? role.name : null;
  } catch (error) {
    console.error("[Auth Action] Помилка отримання ролі за слагом:", error);
    return null;
  }
}

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
    const authService = container.resolve<IAuthService>("IAuthService");
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

    // Викликаємо сервіс автентифікації
    const oauthUrl = await authService.signInWithOAuth(
      "google",
      callbackUrl.toString(),
    );

    // Редірект на сторінку провайдера
    redirect(oauthUrl);
  } catch (error) {
    // Якщо це помилка редіректу Next.js - просто прокидаємо її далі
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    console.error("[Auth Action] Критична помилка:", error);
    redirect(`/?error=${encodeURIComponent("Внутрішня помилка сервера")}`);
  }
}

/**
 * Виконує вихід користувача з системи
 */
export async function signOut() {
  try {
    const authService = container.resolve<IAuthService>("IAuthService");
    await authService.signOut();

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
    const authService = container.resolve<IAuthService>("IAuthService");
    return await authService.getCurrentUser();
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
    const authService = container.resolve<IAuthService>("IAuthService");
    return await authService.getCurrentUser();
  } catch (error) {
    console.error("[Auth Action] Критична помилка оновлення сесії:", error);
    return null;
  }
}
