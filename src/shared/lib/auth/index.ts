/**
 * @file index.ts
 * @description Barrel экспорт для всех хуков авторизации и разрешений.
 *
 * Позволяет импортировать все необходимое из одного места:
 * import { useWorkspaceRole, usePermission, Can } from '@/shared/lib/auth'
 */

// Базовая авторизация (User)
export { useUser, useAuthenticated } from "../../hooks/use-auth";

// Роли в воркспейсах
export {
  useWorkspaceRole,
  useWorkspaceRoleById,
} from "../../hooks/use-workspace-role";

// Разрешения
export {
  usePermission,
  usePermissions,
  useAnyPermission,
  usePermissionChecker,
  useIsAdmin,
  useHasRole,
  useHasAnyRole,
} from "../../hooks/use-permissions";

// Компоненты защиты
export {
  Can,
  CanAll,
  CanAny,
  RequireRole,
  RequireSingleRole,
  WhenLoaded,
  RenderByRole,
} from "../../components/guards/permission-guard";

// Утилиты для работы с разрешениями
export {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getRolePermissions,
  isRoleSeniorTo,
  canManageRole,
  hasPermissionGroup,
  getRoleDisplayName,
  getRoleDescription,
  getAssignableRoles,
  ROLE_PERMISSIONS,
  ROLE_WEIGHTS,
  PERMISSION_GROUPS,
  type Permission,
} from "./permissions";

// Типы
export type { UserRole } from "../validations/schemas";

// Серверні утиліти
export { getFormattedUserData, getCachedUser, isAuthenticated } from "./get-user-data";
export type { FormattedUserData } from "./get-user-data";
