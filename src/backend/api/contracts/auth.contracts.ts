/**
 * Дані користувача для відображення в інтерфейсі (View Model)
 */
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  avatar: string;
  initials: string;
}

/**
 * Статус авторизації
 */
export interface AuthStatusResponse {
  isAuthenticated: boolean;
  user: UserResponse | null;
}
