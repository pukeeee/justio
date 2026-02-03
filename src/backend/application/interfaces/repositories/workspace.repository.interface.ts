import { Workspace } from '@/backend/domain/entities/workspace.entity';

export interface IWorkspaceRepository {
  /**
   * Знаходить всі робочі простори, до яких користувач має доступ (є активним учасником).
   */
  findAllByUserId(userId: string): Promise<Workspace[]>;

  /**
   * Знаходить робочий простір за ID.
   */
  findById(workspaceId: string): Promise<Workspace | null>;

  /**
   * Знаходить робочий простір за слагом (URL-friendly name).
   */
  findBySlug(slug: string): Promise<Workspace | null>;

  /**
   * Зберігає (створює або оновлює) робочий простір.
   */
  save(workspace: Workspace): Promise<void>;

  /**
   * М'яке видалення робочого простору.
   */
  softDelete(workspaceId: string): Promise<void>;

  /**
   * Відновлення м'яко видаленого робочого простору.
   */
  restore(workspaceId: string): Promise<void>;

  /**
   * Повне видалення робочого простору з бази даних.
   */
  hardDelete(workspaceId: string): Promise<void>;
}
