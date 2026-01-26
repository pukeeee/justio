/**
 * Компоненти для умовного рендерингу інтерфейсу
 * на основі дозволів та ролі користувача.
 */

"use client";

import React from "react";
import {
  usePermission,
  usePermissions,
  useAnyPermission,
  useHasRole,
  useHasAnyRole,
} from "@/shared/hooks/use-permissions";
import { type Permission } from "@/shared/lib/auth/permissions";
import { useWorkspaceRole } from "@/shared/hooks/use-workspace-role";
import type { UserRole } from "@/shared/lib/validations/schemas";
import { useAuthenticated } from "@/shared/hooks/use-auth";

// ============================================================================
// КОМПОНЕНТ Can (перевірка одного дозволу)
// ============================================================================

interface CanProps {
  /** Дозвіл, який необхідно перевірити */
  permission: Permission;
  /** Дочірні елементи, що будуть відображені за наявності дозволу */
  children: React.ReactNode;
  /** Запасний UI, що відображається за відсутності дозволу */
  fallback?: React.ReactNode;
}

/**
 * Відображає дочірні елементи, якщо користувач має вказаний дозвіл.
 *
 * @param permission - Дозвіл для перевірки.
 * @param children - Елементи для відображення.
 * @param fallback - Елементи, що відображаються, якщо дозвіл відсутній.
 * @example
 * <Can permission="delete_contact">
 *   <DeleteButton />
 * </Can>
 */
export function Can({ permission, children, fallback = null }: CanProps) {
  const hasPermission = usePermission(permission);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// КОМПОНЕНТ CanAll (перевірка всіх дозволів)
// ============================================================================

interface CanAllProps {
  /** Масив дозволів, які всі повинні бути у користувача */
  permissions: Permission[];
  /** Дочірні елементи, що будуть відображені за наявності всіх дозволів */
  children: React.ReactNode;
  /** Запасний UI, що відображається, якщо хоча б один дозвіл відсутній */
  fallback?: React.ReactNode;
}

/**
 * Відображає дочірні елементи, тільки якщо користувач має ВСІ вказані дозволи.
 *
 * @param permissions - Масив дозволів для перевірки.
 * @param children - Елементи для відображення.
 * @param fallback - Елементи, що відображаються, якщо умова не виконана.
 * @example
 * <CanAll permissions={['create_contact', 'update_contact']}>
 *   <ContactForm />
 * </CanAll>
 */
export function CanAll({
  permissions,
  children,
  fallback = null,
}: CanAllProps) {
  const hasAllPermissions = usePermissions(permissions);

  if (!hasAllPermissions) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// КОМПОНЕНТ CanAny (перевірка будь-якого з дозволів)
// ============================================================================

interface CanAnyProps {
  /** Масив дозволів, з яких хоча б один має бути у користувача */
  permissions: Permission[];
  /** Дочірні елементи, що будуть відображені за наявності будь-якого з дозволів */
  children: React.ReactNode;
  /** Запасний UI, що відображається, якщо всі дозволи відсутні */
  fallback?: React.ReactNode;
}

/**
 * Відображає дочірні елементи, якщо користувач має БУДЬ-ЯКИЙ із вказаних дозволів.
 *
 * @param permissions - Масив дозволів для перевірки.
 * @param children - Елементи для відображення.
 * @param fallback - Елементи, що відображаються, якщо умова не виконана.
 * @example
 * <CanAny permissions={['view_all_contacts', 'view_own_contacts']}>
 *   <ContactList />
 * </CanAny>
 */
export function CanAny({
  permissions,
  children,
  fallback = null,
}: CanAnyProps) {
  const hasAnyPermission = useAnyPermission(permissions);

  if (!hasAnyPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// КОМПОНЕНТИ НА ОСНОВІ РОЛЕЙ
// ============================================================================

interface RequireRoleProps {
  /** Масив ролей, одна з яких має бути у користувача */
  roles: UserRole[];
  /** Дочірні елементи, що будуть відображені за відповідності ролі */
  children: React.ReactNode;
  /** Запасний UI, що відображається, якщо роль не відповідає */
  fallback?: React.ReactNode;
}

/**
 * Відображає дочірні елементи, тільки якщо користувач має одну із вказаних ролей.
 *
 * @param roles - Масив ролей для перевірки.
 * @param children - Елементи для відображення.
 * @param fallback - Елементи, що відображаються, якщо умова не виконана.
 * @example
 * <RequireRole roles={['owner', 'admin']}>
 *   <AdminPanel />
 * </RequireRole>
 */
export function RequireRole({
  roles,
  children,
  fallback = null,
}: RequireRoleProps) {
  const hasRole = useHasAnyRole(roles);

  if (!hasRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RequireSingleRoleProps {
  /** Конкретная роль, которая должна быть у пользователя */
  role: UserRole;
  /** Дочерние элементы, которые будут отображены при соответствии роли */
  children: React.ReactNode;
  /** Запасной UI, отображаемый, если роль не соответствует */
  fallback?: React.ReactNode;
}

/**
 * Отображает дочерние элементы, только если пользователь имеет точную указанную роль.
 *
 * @example
 * <RequireSingleRole role="owner">
 *   <BillingSettings />
 * </RequireSingleRole>
 */
export function RequireSingleRole({
  role,
  children,
  fallback = null,
}: RequireSingleRoleProps) {
  const hasRole = useHasRole(role);

  if (!hasRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// КОМПОНЕНТ ДЛЯ ОТОБРАЖЕНИЯ КОНТЕНТА ПО LOADING СОСТОЯНИЮ
// ============================================================================

interface WhenLoadedProps {
  /** Дочерние элементы для отображения после загрузки */
  children: React.ReactNode;
  /** Fallback во время загрузки */
  fallback?: React.ReactNode;
}

/**
 * Отображает дочерние элементы только после того, как роль загрузилась.
 * Полезно для предотвращения мигания контента.
 *
 * @example
 * <WhenLoaded fallback={<Skeleton />}>
 *   <Can permission="delete_contact">
 *     <DeleteButton />
 *   </Can>
 * </WhenLoaded>
 */
export function WhenLoaded({ children, fallback = null }: WhenLoadedProps) {
  const { loading } = useWorkspaceRole();

  if (loading) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// СЕРВІСНІ КОМПОНЕНТИ
// ============================================================================

interface ShowWhenAuthenticatedProps {
  /** Дочірні елементи, що будуть відображені */
  children: React.ReactNode;
  /** Запасний UI, що відображається, якщо умова не виконана */
  fallback?: React.ReactNode;
}

/**
 * Відображає дочірні елементи, тільки якщо користувач автентифікований.
 */
export function ShowWhenAuthenticated({
  children,
  fallback = null,
}: ShowWhenAuthenticatedProps) {
  const isAuthenticated = useAuthenticated();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Відображає дочірні елементи, тільки якщо користувач НЕ автентифікований (гість).
 */
export function ShowWhenGuest({
  children,
  fallback = null,
}: ShowWhenAuthenticatedProps) {
  const isAuthenticated = useAuthenticated();

  if (isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// УТИЛИТА ДЛЯ ОТОБРАЖЕНИЯ РАЗНОГО КОНТЕНТА ПО РОЛИ
// ============================================================================

interface RenderByRoleProps {
  /** Мапа роли к компоненту */
  roleMap: Partial<Record<UserRole, React.ReactNode>>;
  /** Fallback, если роль не найдена в мапе */
  fallback?: React.ReactNode;
}

/**
 * Рендерит разный контент в зависимости от роли пользователя.
 *
 * @example
 * <RenderByRole
 *   roleMap={{
 *     owner: <OwnerDashboard />,
 *     admin: <AdminDashboard />,
 *     user: <UserDashboard />,
 *   }}
 *   fallback={<GuestView />}
 * />
 */
export function RenderByRole({ roleMap, fallback = null }: RenderByRoleProps) {
  const { role, loading } = useWorkspaceRole();

  if (loading) {
    return null;
  }

  if (!role) {
    return <>{fallback}</>;
  }

  return <>{roleMap[role] ?? fallback}</>;
}

// ============================================================================
// КОМПОНЕНТИ НА ОСНОВІ ФУНКЦІЙ (за підпискою)
// ============================================================================

// interface RequireFeatureProps {
//   /** Назва функції, доступ до якої перевіряється */
//   feature: string;
//   /** Дочірні елементи, що будуть відображені за наявності доступу до функції */
//   children: React.ReactNode;
//   /** Запасний UI, що відображається, якщо доступ до функції відсутній */
//   fallback?: React.ReactNode;
// }

// /**
//  * Відображає дочірні елементи, тільки якщо функція доступна для поточної підписки.
//  *
//  * @param feature - Назва функції для перевірки.
//  * @param children - Елементи для відображення.
//  * @param fallback - Елементи, що відображаються, якщо умова не виконана.
//  * @example
//  * <RequireFeature feature="automation">
//  *   <AutomationPanel />
//  * </RequireFeature>
//  */
// export function RequireFeature({
//   feature,
//   children,
//   fallback = null,
// }: RequireFeatureProps) {
//   const hasAccess = useFeatureAccess(feature);

//   if (!hasAccess) {
//     return <>{fallback}</>;
//   }

//   return <>{children}</>;
// }
