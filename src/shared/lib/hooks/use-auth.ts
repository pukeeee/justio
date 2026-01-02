/**
 * Хуки React для керування автентифікацією та доступом,
 * спрощені для використання єдиного контексту AuthContext.
 * @see useAuthContext
 */

"use client";

import { useAuthContext } from "@/shared/lib/context/auth-context";
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  type Permission,
} from "@/shared/lib/auth/permissions";

// ============================================================================
// ХУКИ АВТЕНТИФІКАЦІЇ
// ============================================================================

/**
 * @function useUser
 * @description Хук для отримання поточного автентифікованого користувача.
 */
export function useUser() {
  const { user, loading } = useAuthContext();
  return { user, loading };
}

/**
 * @function useAuth
 * @description Хук для перевірки, чи користувач автентифікований.
 */
export function useAuth() {
  const { user, loading } = useAuthContext();
  return { isAuthenticated: !!user, user, loading };
}

// ============================================================================
// ХУКИ РОБОЧОГО ПРОСТОРУ
// ============================================================================

/**
 * @function useWorkspace
 * @description Хук для отримання поточного робочого простору та ролі користувача в ньому.
 */
export function useWorkspace() {
  const { workspace, workspaceUser, role, loading, refresh } = useAuthContext();
  return {
    workspace,
    workspaceUser,
    role,
    loading,
    refresh,
  };
}

// ============================================================================
// ХУКИ ДОЗВОЛІВ
// ============================================================================

/**
 * @function usePermission
 * @description Хук для перевірки, чи має поточний користувач певний дозвіл.
 */
export function usePermission(permission: Permission): boolean {
  const { role } = useAuthContext();
  if (!role) return false;
  return hasPermission(role, permission);
}

/**
 * @function usePermissions
 * @description Хук для перевірки, чи має поточний користувач всі зазначені дозволи.
 */
export function usePermissions(permissions: Permission[]): boolean {
  const { role } = useAuthContext();
  if (!role) return false;
  return hasAllPermissions(role, permissions);
}

/**
 * @function useAnyPermission
 * @description Хук для перевірки, чи має поточний користувач хоча б один із зазначених дозволів.
 */
export function useAnyPermission(permissions: Permission[]): boolean {
  const { role } = useAuthContext();
  if (!role) return false;
  return hasAnyPermission(role, permissions);
}

/**
 * @function usePermissionChecker
 * @description Хук, що повертає об'єкт з функціями для перевірки дозволів.
 */
export function usePermissionChecker() {
  const { role } = useAuthContext();

  return {
    can: (permission: Permission) =>
      role ? hasPermission(role, permission) : false,
    canAll: (permissions: Permission[]) =>
      role ? hasAllPermissions(role, permissions) : false,
    canAny: (permissions: Permission[]) =>
      role ? hasAnyPermission(role, permissions) : false,
  };
}

// ============================================================================
// ХУКИ ПІДПИСКИ
// ============================================================================

/**
 * @function useSubscription
 * @description Хук для отримання даних про підписку поточного робочого простору.
 */
export function useSubscription() {
  const { subscription, loading } = useAuthContext();

  return {
    subscription,
    tier: subscription?.tier ?? "free",
    status: subscription?.status ?? "trialing",
    loading,
  };
}

/**
 * @function useFeatureAccess
 * @description Хук для перевірки, чи доступна певна функція для поточної підписки.
 */
export function useFeatureAccess(feature: string): boolean {
  const { subscription } = useAuthContext();

  if (!subscription) return false;

  // Перевірка, чи включена функція в кастомні модулі
  if (subscription.enabled_modules?.includes(feature)) {
    return true;
  }

  // Перевірка доступу на основі тарифного плану
  const tierFeatures: Record<string, string[]> = {
    free: ["basic_crm"],
    starter: ["basic_crm", "nova_poshta", "email"],
    pro: [
      "basic_crm",
      "nova_poshta",
      "email",
      "analytics",
      "automation",
      "api",
    ],
    enterprise: ["*"], // Всі функції доступні
  };

  if (subscription.tier === "enterprise") return true;

  return tierFeatures[subscription.tier]?.includes(feature) ?? false;
}

// ============================================================================
// ХУКИ КВОТ
// ============================================================================

/**
 * @function useQuotas
 * @description Хук для отримання квот та їх використання робочим простором.
 */
export function useQuotas() {
  const { quotas, loading } = useAuthContext();

  return {
    quotas,
    loading,
    canAddContact: quotas
      ? quotas.current_contacts < quotas.max_contacts
      : false,
    canAddDeal: quotas ? quotas.current_deals < quotas.max_deals : false,
    canAddUser: quotas ? quotas.current_users < quotas.max_users : false,
  };
}
