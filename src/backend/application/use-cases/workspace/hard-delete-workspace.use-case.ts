import { injectable, inject } from "tsyringe";
import type { IWorkspaceRepository } from "@/backend/application/interfaces/repositories/workspace.repository.interface";
import { EntityNotFoundError } from "@/backend/domain/errors/invalid-data.error";
import { ForbiddenError } from "@/backend/domain/errors/authorization.errors";

/**
 * Use Case для повного видалення воркспейсу.
 * 
 * КРИТИЧНО: Ця операція незворотня і видаляє всі пов'язані дані 
 * (клієнтів, справи, документи тощо) через каскадне видалення в БД.
 */
@injectable()
export class HardDeleteWorkspaceUseCase {
  constructor(
    @inject("IWorkspaceRepository")
    private readonly workspaceRepository: IWorkspaceRepository,
  ) {}

  async execute(params: { workspaceId: string; userId: string }): Promise<void> {
    const { workspaceId, userId } = params;

    // 1. Знаходимо воркспейс (включаючи м'яко видалені)
    // Ми використовуємо прямий доступ до БД без фільтрації по deletedAt
    // (нам потрібен метод findById, який ігнорує deletedAt для повної перевірки)
    const workspace = await this.workspaceRepository.findById(workspaceId);
    
    if (!workspace) {
      throw new EntityNotFoundError("Робочий простір", workspaceId);
    }

    // 2. Перевірка прав (тільки власник може виконати повне видалення)
    if (workspace.ownerId !== userId) {
      throw new ForbiddenError("Тільки власник може повністю видалити робочий простір");
    }

    // 3. Виконуємо повне видалення
    // Завдяки ON DELETE CASCADE в схемі БД, всі пов'язані дані видаляться автоматично
    await this.workspaceRepository.hardDelete(workspaceId);
  }
}
