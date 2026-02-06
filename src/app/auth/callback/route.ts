/**
 * @file route.ts
 * @description Обробник OAuth callback для завершення автентифікації
 *
 * Покращення:
 * - Детальне логування помилок
 * - Валідація параметрів
 * - Безпечні редіректи
 * - Обробка edge cases
 */

import { type NextRequest, NextResponse } from "next/server";
import { container } from "@/backend/infrastructure/di/container";
import { IAuthService } from "@/backend/application/interfaces/services/auth.service.interface";

/**
 * Список дозволених шляхів для редіректу (захист від open redirect)
 * Має відповідати основним розділам додатку.
 */
const ALLOWED_REDIRECT_PATHS = ["/dashboard", "/docs", "/user"];

/**
 * Валідує та санітизує redirect path
 */
function getSafeRedirectPath(path: string | null, origin: string): string {
  if (!path) return origin;

  // Перевіряємо, чи шлях є відносним
  if (!path.startsWith("/")) return origin;

  // Перевіряємо, чи шлях в білому списку
  const isAllowed = ALLOWED_REDIRECT_PATHS.some((allowed) =>
    path.startsWith(allowed),
  );

  if (!isAllowed) return origin;

  return `${origin}${path}`;
}

/**
 * GET handler для OAuth callback
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Логування для debugging (тільки на dev)
  if (process.env.NODE_ENV === "development") {
    console.log("[Auth Callback] Params:", { code: !!code, next, error });
  }

  // 1. Перевірка помилок від OAuth провайдера
  if (error) {
    console.error(`[Auth Callback] OAuth помилка: ${error}`, errorDescription);

    const redirectUrl = new URL("/", origin);
    redirectUrl.searchParams.set(
      "error",
      errorDescription || "Помилка автентифікації. Спробуйте ще раз.",
    );

    return NextResponse.redirect(redirectUrl);
  }

  // 2. Перевірка наявності коду авторизації
  if (!code) {
    console.error("[Auth Callback] Відсутній код авторизації");

    const redirectUrl = new URL("/", origin);
    redirectUrl.searchParams.set(
      "error",
      "Не вдалося отримати код авторизації. Спробуйте ще раз.",
    );

    return NextResponse.redirect(redirectUrl);
  }

  try {
    // 3. Обмін коду на сесію за допомогою нашого сервісу
    const authService = container.resolve<IAuthService>("IAuthService");
    await authService.exchangeCodeForSession(code);

    // 4. Успішна автентифікація - безпечний редірект
    const redirectPath = getSafeRedirectPath(next, origin);

    if (process.env.NODE_ENV === "development") {
      console.log(
        "[Auth Callback] Успішна автентифікація, редірект на:",
        redirectPath,
      );
    }

    return NextResponse.redirect(redirectPath);
  } catch (error) {
    // 5. Обробка помилок обміну коду
    console.error("[Auth Callback] Помилка обміну коду:", error);

    const redirectUrl = new URL("/", origin);
    redirectUrl.searchParams.set(
      "error",
      error instanceof Error
        ? error.message
        : "Не вдалося завершити автентифікацію. Спробуйте ще раз.",
    );

    return NextResponse.redirect(redirectUrl);
  }
}
