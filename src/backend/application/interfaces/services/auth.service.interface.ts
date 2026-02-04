/**
 * Інтерфейс для сервісу автентифікації та авторизації.
 *
 * ПРИЗНАЧЕННЯ:
 * Цей інтерфейс є "контрактом" между Application Layer та Infrastructure Layer.
 */

import {
  AuthenticatedUser,
  AuthResult,
} from "@/backend/application/dtos/auth/auth-result.dto";

export {
  InvalidCredentialsError,
  EmailAlreadyExistsError,
  InvalidTokenError,
} from "@/backend/domain/errors/auth.errors";

/**
 * Інтерфейс сервісу автентифікації.
 *
 * ВАЖЛИВО: Цей інтерфейс НЕ знає про Supabase, JWT, або конкретні деталі реалізації.
 * Він описує тільки ЩО потрібно робити, а не ЯК це робити.
 */
export interface IAuthService {
  /**
   * Отримує поточного автентифікованого користувача з контексту запиту.
   *
   * @returns Об'єкт користувача або null, якщо не автентифікований
   * @throws Не кидає помилки, повертає null при відсутності сесії
   */
  getCurrentUser(): Promise<AuthenticatedUser | null>;

  /**
   * Перевіряє, чи автентифікований користувач.
   *
   * @returns true якщо є валідна сесія
   */
  isAuthenticated(): Promise<boolean>;

  /**
   * Виконує sign up (реєстрацію) нового користувача.
   *
   * @param email - Email користувача
   * @param password - Пароль
   * @returns Результат автентифікації
   * @throws InvalidCredentialsError якщо email вже зайнятий
   */
  signUp(email: string, password: string): Promise<AuthResult>;

  /**
   * Виконує sign in (вхід) існуючого користувача.
   *
   * @param email - Email користувача
   * @param password - Пароль
   * @returns Результат автентифікації
   * @throws InvalidCredentialsError якщо невірні дані
   */
  signIn(email: string, password: string): Promise<AuthResult>;

  /**
   * Ініціює вхід через стороннього провайдера (OAuth).
   *
   * @param provider - Назва провайдера ('google', 'github' тощо)
   * @param redirectTo - URL для повернення після автентифікації
   * @returns URL для перенаправлення користувача
   */
  signInWithOAuth(provider: string, redirectTo: string): Promise<string>;

  /**
   * Обмінює тимчасовий код на сесію користувача.
   * Використовується в OAuth callback маршрутах.
   *
   * @param code - Код, отриманий від провайдера
   */
  exchangeCodeForSession(code: string): Promise<void>;

  /**
   * Виконує sign out (вихід) поточного користувача.
   *
   * @returns void
   */
  signOut(): Promise<void>;

  /**
   * Оновлює access token використовуючи refresh token.
   *
   * @param refreshToken - Refresh token
   * @returns Новий access token
   * @throws InvalidTokenError якщо refresh token невалідний
   */
  refreshAccessToken(refreshToken: string): Promise<string>;

  /**
   * Надсилає email для скидання паролю.
   *
   * @param email - Email користувача
   * @returns void
   */
  sendPasswordResetEmail(email: string): Promise<void>;

  /**
   * Скидає пароль за токеном з email.
   *
   * @param token - Токен з email
   * @param newPassword - Новий пароль
   * @returns void
   * @throws InvalidTokenError якщо токен невалідний або прострочений
   */
  resetPassword(token: string, newPassword: string): Promise<void>;
}
