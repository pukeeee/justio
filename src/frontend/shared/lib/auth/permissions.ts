/**
 * Система контролю доступу на основі ролей (RBAC).
 * Визначає дозволи для кожної ролі та надає допоміжні функції для їх перевірки.
 */

import { type UserRole } from "@/frontend/shared/lib/validations/schemas";

// ============================================================================
// МАТРИЦЯ ДОЗВОЛІВ
// ============================================================================

/**
 * Тип, що перелічує всі можливі дозволи в системі.
 */
export type Permission =
  // Керування робочим простором
  | "create_workspace"
  | "delete_workspace"
  | "update_workspace_settings"
  | "manage_billing"
  // Керування користувачами
  | "invite_users"
  | "remove_users"
  | "update_user_roles"
  // Контакти
  | "view_all_contacts"
  | "view_own_contacts"
  | "create_contact"
  | "update_any_contact"
  | "update_own_contact"
  | "delete_contact"
  // Компанії
  | "view_all_companies"
  | "create_company"
  | "update_company"
  | "delete_company"
  // Угоди
  | "view_all_deals"
  | "view_own_deals"
  | "create_deal"
  | "update_any_deal"
  | "update_own_deal"
  | "delete_deal"
  // Завдання
  | "view_all_tasks"
  | "view_assigned_tasks"
  | "create_task"
  | "assign_task_to_others"
  | "update_any_task"
  | "update_assigned_task"
  | "delete_task"
  // Продукти
  | "view_products"
  | "create_product"
  | "update_product"
  | "delete_product"
  // Звіти та аналітика
  | "view_own_reports"
  | "view_all_reports"
  | "export_data"
  // Інтеграції
  | "manage_integrations"
  | "use_integrations"
  // Комунікації
  | "send_individual_emails"
  | "send_bulk_emails";

/**
 * Карта дозволів для ролей.
 * Визначає, які дозволи має кожна роль.
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [
    // Всі дозволи
    "create_workspace",
    "delete_workspace",
    "update_workspace_settings",
    "manage_billing",
    "invite_users",
    "remove_users",
    "update_user_roles",
    "view_all_contacts",
    "create_contact",
    "update_any_contact",
    "delete_contact",
    "view_all_companies",
    "create_company",
    "update_company",
    "delete_company",
    "view_all_deals",
    "create_deal",
    "update_any_deal",
    "delete_deal",
    "view_all_tasks",
    "create_task",
    "assign_task_to_others",
    "update_any_task",
    "delete_task",
    "view_products",
    "create_product",
    "update_product",
    "delete_product",
    "view_all_reports",
    "export_data",
    "manage_integrations",
    "use_integrations",
    "send_individual_emails",
    "send_bulk_emails",
  ],
  admin: [
    // Майже всі дозволи, крім білінгу та видалення робочого простору
    "update_workspace_settings",
    "invite_users",
    "remove_users",
    "update_user_roles",
    "view_all_contacts",
    "create_contact",
    "update_any_contact",
    "delete_contact",
    "view_all_companies",
    "create_company",
    "update_company",
    "delete_company",
    "view_all_deals",
    "create_deal",
    "update_any_deal",
    "delete_deal",
    "view_all_tasks",
    "create_task",
    "assign_task_to_others",
    "update_any_task",
    "delete_task",
    "view_products",
    "create_product",
    "update_product",
    "delete_product",
    "view_all_reports",
    "export_data",
    "manage_integrations",
    "use_integrations",
    "send_individual_emails",
    "send_bulk_emails",
  ],
  manager: [
    // Більшість операційних дозволів
    "view_all_contacts",
    "create_contact",
    "update_any_contact",
    "delete_contact",
    "view_all_companies",
    "create_company",
    "update_company",
    "view_all_deals",
    "create_deal",
    "update_any_deal",
    "delete_deal",
    "view_all_tasks",
    "create_task",
    "assign_task_to_others",
    "update_any_task",
    "view_products",
    "create_product",
    "update_product",
    "view_all_reports",
    "export_data",
    "use_integrations",
    "send_individual_emails",
  ],
  user: [
    // Обмежені дозволи, переважно для роботи з власними даними
    "view_own_contacts",
    "create_contact",
    "update_own_contact",
    "view_all_companies",
    "view_own_deals",
    "create_deal",
    "update_own_deal",
    "view_assigned_tasks",
    "create_task",
    "update_assigned_task",
    "view_products",
    "view_own_reports",
    "use_integrations",
    "send_individual_emails",
  ],
};

// ============================================================================
// ФУНКЦІЇ ПЕРЕВІРКИ ДОЗВОЛІВ
// ============================================================================

/**
 * Перевіряє, чи має роль конкретний дозвіл.
 * @param role - Роль користувача.
 * @param permission - Дозвіл для перевірки.
 * @returns `true`, якщо роль має дозвіл, інакше `false`.
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Перевіряє, чи має роль ВСІ із зазначених дозволів.
 * @param role - Роль користувача.
 * @param permissions - Масив дозволів для перевірки.
 * @returns `true`, якщо роль має всі дозволи, інакше `false`.
 */
export function hasAllPermissions(
  role: UserRole,
  permissions: Permission[],
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Перевіряє, чи має роль БУДЬ-ЯКИЙ із зазначених дозволів.
 * @param role - Роль користувача.
 * @param permissions - Масив дозволів для перевірки.
 * @returns `true`, якщо роль має хоча б один дозвіл, інакше `false`.
 */
export function hasAnyPermission(
  role: UserRole,
  permissions: Permission[],
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Повертає всі дозволи для зазначеної ролі.
 * @param role - Роль користувача.
 * @returns Масив дозволів.
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role];
}

// ============================================================================
// ІЄРАРХІЯ РОЛЕЙ
// ============================================================================

/**
 * Ваги ролей для ієрархічних перевірок (вища вага = більше повноважень).
 */
export const ROLE_WEIGHTS: Record<UserRole, number> = {
  owner: 5,
  admin: 4,
  manager: 3,
  user: 2,
};

/**
 * Перевіряє, чи є одна роль старшою за іншу.
 * @example isRoleSeniorTo('admin', 'user') => true
 * @param role - Роль, яку перевіряємо.
 * @param comparedTo - Роль, з якою порівнюємо.
 * @returns `true`, якщо перша роль старша за другу.
 */
export function isRoleSeniorTo(role: UserRole, comparedTo: UserRole): boolean {
  return ROLE_WEIGHTS[role] > ROLE_WEIGHTS[comparedTo];
}

/**
 * Перевіряє, чи може одна роль керувати іншою.
 * Правила: Можна керувати ролями з рівною або нижчою вагою.
 * Виняток: Адміністратор не може керувати Власником.
 * @param managerRole - Роль, яка намагається керувати.
 * @param targetRole - Роль, якою намагаються керувати.
 * @returns `true`, якщо керування дозволено.
 */
export function canManageRole(
  managerRole: UserRole,
  targetRole: UserRole,
): boolean {
  if (managerRole === "owner") return true;
  if (targetRole === "owner") return false;
  return ROLE_WEIGHTS[managerRole] >= ROLE_WEIGHTS[targetRole];
}

// ============================================================================
// ГРУПИ ДОЗВОЛІВ
// ============================================================================

/**
 * Попередньо визначені групи дозволів для частих перевірок.
 */
export const PERMISSION_GROUPS = {
  canManageTeam: [
    "invite_users",
    "remove_users",
    "update_user_roles",
  ] as Permission[],
  canManageContacts: [
    "create_contact",
    "update_any_contact",
    "delete_contact",
  ] as Permission[],
  canManageDeals: [
    "create_deal",
    "update_any_deal",
    "delete_deal",
  ] as Permission[],
  canManageProducts: [
    "create_product",
    "update_product",
    "delete_product",
  ] as Permission[],
  canViewAllData: [
    "view_all_contacts",
    "view_all_deals",
    "view_all_tasks",
  ] as Permission[],
  canExportData: ["view_all_reports", "export_data"] as Permission[],
} as const;

/**
 * Перевіряє, чи має роль доступ до всієї групи дозволів.
 * @param role - Роль користувача.
 * @param group - Назва групи дозволів.
 * @returns `true`, якщо роль має всі дозволи з групи.
 */
export function hasPermissionGroup(
  role: UserRole,
  group: keyof typeof PERMISSION_GROUPS,
): boolean {
  return hasAllPermissions(role, PERMISSION_GROUPS[group]);
}

// ============================================================================
// ДОПОМІЖНІ ФУНКЦІЇ ДЛЯ ВІДОБРАЖЕННЯ
// ============================================================================

/**
 * Повертає назву ролі, придатну для відображення (українською).
 * @param role - Роль користувача.
 */
export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    owner: "Власник",
    admin: "Адміністратор",
    manager: "Менеджер",
    user: "Користувач",
  };
  return names[role];
}

/**
 * Повертає опис ролі (українською).
 * @param role - Роль користувача.
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    owner: "Повний доступ до всіх функцій та налаштувань",
    admin: "Керування командою та даними, крім білінгу",
    manager: "Керування клієнтами, угодами та завданнями",
    user: "Робота з власними клієнтами та угодами",
  };
  return descriptions[role];
}

/**
 * Повертає список ролей, які може призначати поточний користувач.
 * @param currentUserRole - Роль поточного користувача.
 */
export function getAssignableRoles(currentUserRole: UserRole): UserRole[] {
  const allRoles: UserRole[] = ["owner", "admin", "manager", "user"];

  // Власник може призначати будь-які ролі
  if (currentUserRole === "owner") return allRoles;

  // Інші можуть призначати ролі з вагою, що не перевищує їх власну
  return allRoles.filter(
    (role) => ROLE_WEIGHTS[role] <= ROLE_WEIGHTS[currentUserRole],
  );
}
