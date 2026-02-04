/**
 * Supabase Auth Adapter - реалізація IAuthService для Supabase.
 * 
 * ПАТТЕРН: Adapter (Wrapper)
 * 
 * ПРИЗНАЧЕННЯ:
 * Цей клас "обгортає" Supabase Auth API і приводить його до нашого
 * стандартного інтерфейсу IAuthService. Завдяки цьому:
 * 1. Use Cases не залежать від Supabase
 * 2. Легко замінити Supabase на інший провайдер
 * 3. Легше тестувати (можна створити mock-реалізацію)
 * 
 * ВАЖЛИВО:
 * - Всі Supabase-специфічні помилки перетворюються на наші Domain Errors
 * - Всі Supabase типи маппяться на наші типи
 * - Використовуємо cookies для збереження JWT токенів
 */

import { injectable } from 'tsyringe';
import { Provider } from '@supabase/supabase-js';
import { createSupabaseServerClient } from './supabase-server-client';
import {
  IAuthService,
} from '@/backend/application/interfaces/services/auth.service.interface';
import { AuthenticatedUser, AuthResult } from '@/backend/application/dtos/auth/auth-result.dto';
import { 
  InvalidCredentialsError, 
  EmailAlreadyExistsError, 
  InvalidTokenError 
} from '@/backend/domain/errors/auth.errors';

/**
 * Реалізація IAuthService для Supabase Auth.
 */
@injectable()
export class SupabaseAuthAdapter implements IAuthService {
  /**
   * Отримує поточного користувача з Supabase сесії.
   */
  async getCurrentUser(): Promise<AuthenticatedUser | null> {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email!,
      emailVerified: !!user.email_confirmed_at,
      fullName: user.user_metadata?.full_name || user.user_metadata?.name,
      avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
    };
  }

  /**
   * Перевіряє наявність валідної сесії.
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  /**
   * Реєстрація нового користувача через Supabase Auth.
   */
  async signUp(email: string, password: string): Promise<AuthResult> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      // Мапимо Supabase помилки на наші Domain Errors
      if (error.message.includes('already registered')) {
        throw new EmailAlreadyExistsError(email);
      }
      throw new InvalidCredentialsError(error.message);
    }

    if (!data.user || !data.session) {
      throw new InvalidCredentialsError('Не вдалося створити користувача');
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        emailVerified: !!data.user.email_confirmed_at,
        fullName: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
        avatarUrl: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
      },
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  /**
   * Вхід існуючого користувача через Supabase Auth.
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Мапимо Supabase помилки
      throw new InvalidCredentialsError('Невірний email або пароль');
    }

    if (!data.user || !data.session) {
      throw new InvalidCredentialsError('Не вдалося увійти');
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        emailVerified: !!data.user.email_confirmed_at,
        fullName: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
        avatarUrl: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
      },
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }

  /**
   * Ініціює вхід через стороннього провайдера (OAuth).
   */
  async signInWithOAuth(provider: string, redirectTo: string): Promise<string> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error || !data.url) {
      throw new InvalidCredentialsError(error?.message || 'Не вдалося ініціювати OAuth');
    }

    return data.url;
  }

  /**
   * Обмінює тимчасовий код на сесію користувача.
   */
  async exchangeCodeForSession(code: string): Promise<void> {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      throw new InvalidTokenError(error.message);
    }
  }

  /**
   * Вихід з системи.
   */
  async signOut(): Promise<void> {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  /**
   * Оновлення access token за допомогою refresh token.
   */
  async refreshAccessToken(refreshToken: string): Promise<string> {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new InvalidTokenError('Не вдалося оновити токен');
    }

    return data.session.access_token;
  }

  /**
   * Надсилає email для скидання паролю.
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    if (error) {
      console.error('Failed to send password reset email:', error);
      // Не кидаємо помилку, щоб не розкривати наявність email в системі
    }
  }

  /**
   * Скидає пароль за токеном з email.
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const supabase = await createSupabaseServerClient();

    // 1. Обмінюємо recovery token на сесію
    const { data: { session }, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery',
    });

    if (verifyError || !session) {
      throw new InvalidTokenError('Невалідний або прострочений токен відновлення');
    }

    // 2. Оновлюємо пароль (тепер ми авторизовані завдяки сесії)
    // Важливо: createServerClient міг не підхопити сесію автоматично, тому ми
    // можемо явно встановити сесію, але в контексті verifyOtp це зазвичай працює,
    // якщо ми використовуємо той самий інстанс клієнта.
    // АЛЕ: Для надійності краще використати updateUser БЕЗ перевірки поточної сесії,
    // якщо ми вже знаємо, що verifyOtp пройшов успішно? Ні, updateUser вимагає Auth.
    
    // Оскільки verifyOtp логінить юзера в поточному клієнті:
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      throw new InvalidTokenError('Не вдалося оновити пароль');
    }
  }
}
