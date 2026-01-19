/**
 * @file proxy.ts
 * @description Next.js Proxy (Middleware) для керування автентифікацією.
 */

// Імпортуємо необхідні типи з Next.js та клієнт Supabase для серверного середовища.
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Список маршрутів, які потребують автентифікації для доступу.
// В майбутньому сюди можна додати нові, наприклад, '/settings', '/analytics' тощо.
const protectedRoutes = ["/dashboard", "/docs"];

export async function proxy(request: NextRequest) {
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
  // Цей метод також автоматично оновить токен доступу, якщо він застарів.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Перевіряємо, чи є поточний маршрут запиту захищеним.
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  // 1. Захист захищених маршрутів.
  // Якщо користувач не автентифікований (`!user`) і намагається отримати доступ
  // до захищеного маршруту, його буде перенаправлено на сторінку входу.
  if (!user && isProtectedRoute) {
    // Створюємо URL для перенаправлення на сторінку /.
    const redirectUrl = new URL("/", request.url);
    // Додаємо параметр `redirect`, щоб після успішного входу повернути користувача
    // на сторінку, яку він спочатку запитував.
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Обробка для вже автентифікованих користувачів.
  // Якщо користувач вже увійшов в систему (`user`) і намагається зайти на `/`,
  // його буде перенаправлено на головну сторінку кабінету.
  // if (user && request.nextUrl.pathname === "/") {
  //   return NextResponse.redirect(new URL("/dashboard", request.url));
  // }

  // Якщо жодна з умов перенаправлення не спрацювала, продовжуємо до запитаної сторінки.
  // Повертаємо об'єкт `response`, який може містити оновлені cookies.
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
