/**
 * @file auth-context.tsx
 * @description Провайдер контексту для керування сесією та даними користувача.
 */

"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getSession } from "@/frontend/features/auth/actions/auth.actions";

// ============================================================================
// Типи
// ============================================================================

/**
 * Інтерфейс користувача для фронтенд-контексту.
 * Повністю відповідає нашому доменному AuthenticatedUser.
 */
export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  /**
   * Дозволяє вручну оновити дані користувача (наприклад, після зміни профілю)
   */
  refreshUser: () => Promise<void>;
  /**
   * Дозволяє примусово встановити користувача
   */
  setUser: (user: AuthUser | null) => void;
}

// ============================================================================
// Контекст
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Провайдер
// ============================================================================

interface AuthProviderProps {
  children: React.ReactNode;
  /**
   * Початкові дані користувача, отримані на сервері (для уникнення миготіння)
   */
  initialUser?: AuthUser | null;
}

export function AuthProvider({
  children,
  initialUser = null,
}: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);

  /**
   * Отримує поточну сесію через наш бекенд (Server Action)
   */
  const refreshUser = useCallback(async () => {
    try {
      // Викликаємо наш серверний екшен, який використовує AuthService
      const currentUser = await getSession();
      setUser(currentUser);
    } catch (error) {
      console.error("[AuthContext] Помилка отримання сесії:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Ініціалізація при монтуванні, якщо дані не були передані через SSR
   */
  useEffect(() => {
    if (!initialUser) {
      refreshUser();
    }
  }, [initialUser, refreshUser]);

  const value: AuthContextType = {
    user,
    loading,
    refreshUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// Хук
// ============================================================================

/**
 * Хук для доступу до контексту автентифікації.
 * Використовуйте для отримання поточного юзера в клієнтських компонентах.
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuthContext має використовуватися всередині AuthProvider",
    );
  }
  return context;
}
