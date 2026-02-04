/**
 * Дані автентифікованого користувача.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  emailVerified: boolean;
  fullName?: string;
  avatarUrl?: string;
}

/**
 * Результат операції аутентифікації.
 */
export interface AuthResult {
  user: AuthenticatedUser;
  accessToken: string;
  refreshToken?: string;
}
