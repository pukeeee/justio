/**
 * @file auth-context.tsx
 * @description Провайдер контексту для керування сесією та даними користувача.
 *
 * @history
 * - 2026-01-23: Видалено логіку завантаження воркспейсу, підписок та квот.
 *   Контекст тепер відповідає лише за сесію користувача (User).
 *   Це виправляє баг, коли система неправильно обробляла наявність кількох воркспейсів
 *   і завантажувала в глобальний контекст лише один із них.
 */

"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createBrowserClient } from "@/shared/supabase/client";
import type { User } from "@supabase/supabase-js";

// ============================================================================
// Типи
// ============================================================================

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

// ============================================================================
// Контекст
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Провайдер
// ============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient();

  /**
   * Скидає стан користувача
   */
  const clearUser = useCallback(() => {
    setUser(null);
  }, []);

  /**
   * Ініціалізація сесії та відстеження змін стану автентифікації.
   */
  useEffect(() => {
    let mounted = true;

    // 1. Початкове завантаження даних користувача
    const initializeAuth = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (mounted) {
          setUser(currentUser ?? null);
        }
      } catch (error) {
        console.error("[AuthContext] Помилка ініціалізації:", error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // 2. Підписка на зміни стану автентифікації (вхід, вихід, оновлення токена)
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // Події SIGNED_IN та TOKEN_REFRESHED обробляються однаково:
      // ми просто встановлюємо нового користувача з сесії.
      // Подія INITIAL_SESSION вже оброблена в `initializeAuth`.
      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        setUser(session?.user ?? null);
      }

      if (event === "SIGNED_OUT") {
        clearUser();
      }
    });

    // Відписка при розмонтуванні компонента
    return () => {
      mounted = false;
      authSubscription.unsubscribe();
    };
  }, [supabase, clearUser]);

  const value: AuthContextType = {
    user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// Хук
// ============================================================================

/**
 * Хук для доступу до контексту автентифікації.
 * @returns {AuthContextType} Об'єкт з даними користувача та станом завантаження.
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
