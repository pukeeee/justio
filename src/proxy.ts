/**
 * @file proxy.ts
 * @description Next.js Proxy (Middleware) для керування автентифікацією.
 */

// Імпортуємо необхідні типи з Next.js та клієнт Supabase для серверного середовища.
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Список маршрутів, які потребують автентифікації для доступу.
const protectedRoutes = ["/dashboard", "/docs", "/user"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Створюємо об'єкт відповіді (response), який можна буде змінювати.
  // Це потрібно, щоб ми могли додавати або оновлювати cookies.
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Ініціалізуємо клієнт Supabase для роботи на сервері (в середовищі Edge).
  // Він вимагає URL, ключ та механізм для роботи з cookies.
  const supabase = createServerClient(
    // Ці змінні середовища мають бути налаштовані у вашому проекті (.env.local).
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Цей об'єкт визначає, як Supabase буде читати та записувати cookies для автентифікації.
      cookies: {
        // `getAll` викликається Supabase, щоб прочитати всі cookies із запиту, що надійшов від браузера.
        getAll() {
          return request.cookies.getAll();
        },
        // `setAll` викликається Supabase, щоб встановити (або видалити) cookies для автентифікації у відповідь,
        // яка буде надіслана браузеру.
        setAll(cookiesToSet) {
          // Цей цикл застосовує всі зміни до cookies (встановлення, оновлення, видалення)
          // до нашого об'єкту відповіді.
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // --- Логіка автентифікації ---

  // Намагаємося отримати сесію поточного користувача з cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Перевіряємо, чи є поточний маршрут запиту захищеним.
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // 1. Захист захищених маршрутів.
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Якщо користувач залогінений, але намагається зайти на сторінку логіну (головну)
  // ми МОЖЕМО редіректнути його на /dashboard, але краще залишити це сторінкам.
  
  return response;
}

// Конфігурація для proxy (middleware).
export const config = {
  // `matcher` визначає, для яких шляхів (path) буде виконуватися цей код.
  matcher: [
    /*
     * Цей патерн застосовує middleware до всіх запитів, ОКРІМ:
     * - _next/static (статичні файли: CSS, JS)
     * - _next/image (файли для оптимізації зображень)
     * - favicon.ico (іконка сайту)
     * - будь-яких файлів у публічній папці /public (наприклад, .svg, .png)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
