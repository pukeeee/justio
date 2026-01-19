import { createServerClient } from '@/shared/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Обробник GET-запитів для маршруту /auth/callback.
 * Цей маршрут використовується для завершення процесу OAuth-автентифікації.
 *
 * @param request - Вхідний запит від Next.js.
 * @returns NextResponse - Відповідь з редиректом на потрібну сторінку.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  // Спочатку перевіряємо, чи повернув Google помилку
  const googleError = searchParams.get('error');
  if (googleError) {
    console.error(
      `Помилка від Google: ${googleError} - ${searchParams.get(
        'error_description'
      )}`
    );
    return NextResponse.redirect(
      `${origin}/login?error=Помилка автентифікації через Google.`
    );
  }

  // Якщо коду немає, це нештатна ситуація
  if (!code) {
    console.error('Код авторизації не знайдено в URL.');
    return NextResponse.redirect(
      `${origin}/login?error=Не вдалося отримати код авторизації. Спробуйте ще раз.`
    );
  }

  const supabase = await createServerClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
    code
  );

  if (!exchangeError) {
    const redirectTo = next ? `${origin}${next}` : `${origin}/`;
    return NextResponse.redirect(redirectTo);
  }

  // Якщо сталася помилка під час обміну коду, логуємо її
  console.error(
    'Помилка обміну коду на сесію:',
    JSON.stringify(exchangeError, null, 2)
  );
  return NextResponse.redirect(
    `${origin}/login?error=Не вдалося підтвердити сесію. Перевірте налаштування.`
  );
}
