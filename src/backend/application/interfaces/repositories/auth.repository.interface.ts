import { User } from '@/backend/domain/entities/user.entity';
import { WorkspaceUser } from '@/backend/domain/entities/workspace-user.entity';

/**
 * Інтерфейс репозиторію авторизації.
 * Відповідає за отримання даних, необхідних для прийняття рішень про доступ (RBAC).
 */
export interface IAuthRepository {
  /**
   * Знаходить користувача за його ID.
   */
  findUserById(userId: string): Promise<User | null>;

  /**
   * Знаходить зв'язок користувача з робочим простором.
   * Це основний метод для визначення ролі.
   */
  findWorkspaceUser(userId: string, workspaceId: string): Promise<WorkspaceUser | null>;
}
