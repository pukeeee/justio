import { Permission } from "@/backend/domain/value-objects/permission.enum";
import { Role } from "@/backend/domain/value-objects/role.vo";
import { AuthorizationContext } from "@/backend/application/dtos/auth/authorization-context.dto";

/**
 * Інтерфейс для сервісу авторизації (управління правами доступу).
 *
 * РІЗНИЦЯ МІЖ AUTHENTICATION ТА AUTHORIZATION:
 * - Authentication (IAuthService): "Хто ти?" - перевірка ідентичності користувача
 * - Authorization (IAuthorizationService): "Що ти можеш робити?" - перевірка прав доступу
 *
 * ПАТТЕРН: Role-Based Access Control (RBAC)
 */

/**
 * Інтерфейс сервісу авторизації.
 */
export interface IAuthorizationService {
  /**
   * Отримує роль користувача в workspace.
   *
   * @param userId - ID користувача
   * @param workspaceId - ID workspace
   * @returns Роль або null, якщо користувач не має доступу до workspace
   */
  getUserRole(userId: string, workspaceId: string): Promise<Role | null>;

  /**
   * Отримує роль користувача у воркспейсі за його слагом.
   */
  getUserRoleBySlug(userId: string, slug: string): Promise<Role | null>;

  /**
   * Перевіряє, чи має користувач певний дозвіл у воркспейсі.
   *
   * @param userId - ID користувача
   * @param workspaceId - ID workspace
   * @returns true якщо користувач має будь-який доступ до workspace
   */
  canAccessWorkspace(userId: string, workspaceId: string): Promise<boolean>;

  /**
   * Перевіряє наявність конкретного дозволу.
   *
   * @param userId - ID користувача
   * @param permission - Дозвіл для перевірки
   * @param workspaceId - ID workspace
   * @returns true якщо дозволено
   */
  hasPermission(
    userId: string,
    permission: Permission,
    workspaceId: string,
  ): Promise<boolean>;

  /**
   * Перевіряє наявність дозволу і кидає помилку ForbiddenError, якщо немає.
   *
   * @throws ForbiddenError
   */
  ensureHasPermission(
    userId: string,
    permission: Permission,
    workspaceId: string,
  ): Promise<void>;

  /**
   * Перевіряє доступ до workspace і кидає помилку ForbiddenError, якщо немає.
   *
   * @throws ForbiddenError
   */
  ensureCanAccessWorkspace(userId: string, workspaceId: string): Promise<void>;

  /**
   * Отримує повний контекст авторизації для поточного запиту.
   * Використовується в middleware для додавання контексту до req.
   *
   * @returns Контекст авторизації або null
   */
  getAuthorizationContext(
    userId: string,
    workspaceId: string,
  ): Promise<AuthorizationContext | null>;
}
