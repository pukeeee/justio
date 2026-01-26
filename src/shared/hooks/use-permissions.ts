/**
 * @file use-permissions.ts
 * @description Хуки для проверки разрешений пользователя в текущем воркспейсе.
 * 
 * Эти хуки работают на основе роли, полученной через useWorkspaceRole,
 * и используют систему разрешений из permissions.ts
 */

"use client";

import { useMemo } from "react";
import { useWorkspaceRole } from "./use-workspace-role";
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  type Permission,
} from "@/shared/lib/auth/permissions";
import type { UserRole } from "@/shared/lib/validations/schemas";

/**
 * Хук для проверки одного разрешения в текущем воркспейсе.
 * 
 * @example
 * function DeleteButton() {
 *   const canDelete = usePermission('delete_contact');
 *   
 *   if (!canDelete) return null;
 *   
 *   return <Button onClick={handleDelete}>Delete</Button>;
 * }
 */
export function usePermission(permission: Permission): boolean {
  const { role } = useWorkspaceRole();

  return useMemo(() => {
    if (!role) return false;
    return hasPermission(role, permission);
  }, [role, permission]);
}

/**
 * Хук для проверки ВСЕХ переданных разрешений.
 * 
 * @example
 * function ContactForm() {
 *   const canManage = usePermissions(['create_contact', 'update_contact']);
 *   
 *   if (!canManage) return <AccessDenied />;
 *   
 *   return <Form />;
 * }
 */
export function usePermissions(permissions: Permission[]): boolean {
  const { role } = useWorkspaceRole();

  return useMemo(() => {
    if (!role) return false;
    return hasAllPermissions(role, permissions);
  }, [role, permissions]);
}

/**
 * Хук для проверки ЛЮБОГО из переданных разрешений.
 * 
 * @example
 * function ContactList() {
 *   const canView = useAnyPermission(['view_all_contacts', 'view_own_contacts']);
 *   
 *   if (!canView) return <AccessDenied />;
 *   
 *   return <List />;
 * }
 */
export function useAnyPermission(permissions: Permission[]): boolean {
  const { role } = useWorkspaceRole();

  return useMemo(() => {
    if (!role) return false;
    return hasAnyPermission(role, permissions);
  }, [role, permissions]);
}

/**
 * Хук для получения функции-проверки разрешений.
 * Полезно когда нужно проверить несколько разных разрешений в одном компоненте.
 * 
 * @example
 * function DealCard() {
 *   const checkPermission = usePermissionChecker();
 *   
 *   return (
 *     <div>
 *       {checkPermission('update_any_deal') && <EditButton />}
 *       {checkPermission('delete_deal') && <DeleteButton />}
 *     </div>
 *   );
 * }
 */
export function usePermissionChecker(): (permission: Permission) => boolean {
  const { role } = useWorkspaceRole();

  return useMemo(() => {
    return (permission: Permission) => {
      if (!role) return false;
      return hasPermission(role, permission);
    };
  }, [role]);
}

/**
 * Хук для проверки, является ли пользователь владельцем или администратором.
 * Часто используемая проверка, вынесенная в отдельный хук.
 * 
 * @example
 * function SettingsPage() {
 *   const isAdmin = useIsAdmin();
 *   
 *   if (!isAdmin) return <AccessDenied />;
 *   
 *   return <AdminPanel />;
 * }
 */
export function useIsAdmin(): boolean {
  const { role } = useWorkspaceRole();

  return useMemo(() => {
    return role === "owner" || role === "admin";
  }, [role]);
}

/**
 * Хук для проверки конкретной роли.
 * 
 * @example
 * function OwnerOnlyFeature() {
 *   const isOwner = useHasRole('owner');
 *   
 *   if (!isOwner) return null;
 *   
 *   return <BillingSettings />;
 * }
 */
export function useHasRole(requiredRole: UserRole): boolean {
  const { role } = useWorkspaceRole();

  return useMemo(() => {
    return role === requiredRole;
  }, [role, requiredRole]);
}

/**
 * Хук для проверки, входит ли роль пользователя в список допустимых.
 * 
 * @example
 * function TeamManagement() {
 *   const canManageTeam = useHasAnyRole(['owner', 'admin']);
 *   
 *   if (!canManageTeam) return <AccessDenied />;
 *   
 *   return <TeamSettings />;
 * }
 */
export function useHasAnyRole(requiredRoles: UserRole[]): boolean {
  const { role } = useWorkspaceRole();

  return useMemo(() => {
    if (!role) return false;
    return requiredRoles.includes(role);
  }, [role, requiredRoles]);
}
