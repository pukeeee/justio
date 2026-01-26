/**
 * @file use-auth.ts
 * @description Базові хуки React для роботи з сесією користувача.
 *
 * @history
 * - 2026-01-23: Видалено хуки, що залежали від даних воркспейсу в глобальному контексті
 *   (useWorkspace, usePermission, useSubscription, useQuotas тощо).
 *   Ці хуки були заархівовані і мають бути реалізовані на локальному рівні,
 *   де потрібні відповідні дані.
 */

"use client";

import { useAuthContext } from "@/shared/lib/context/auth-context";

// ============================================================================
// ХУКИ АВТЕНТИФІКАЦІЇ
// ============================================================================

/**
 * @function useUser
 * @description Хук для отримання поточного об'єкта користувача та статусу завантаження.
 */
export function useUser() {
  const { user, loading } = useAuthContext();
  return { user, loading };
}

/**
 * @function useAuthenticated
 * @description Хук для швидкої перевірки, чи користувач автентифікований.
 * @returns {boolean} `true`, якщо користувач залогінений.
 */
export function useAuthenticated(): boolean {
  const { user, loading } = useAuthContext();
  // Повертаємо `false` поки йде завантаження, щоб уникнути миготіння UI
  if (loading) {
    return false;
  }
  return !!user;
}
