import { injectable, inject } from 'tsyringe';
import type { IWorkspaceRepository } from '@/backend/application/interfaces/repositories/workspace.repository.interface';

/**
 * Юзкейс для м'якого видалення робочого простору.
 */
@injectable()
export class DeleteWorkspaceUseCase {
  constructor(
    @inject('IWorkspaceRepository')
    private readonly workspaceRepository: IWorkspaceRepository
  ) {}

  async execute(params: { workspaceId: string; userId: string }): Promise<void> {
    const { workspaceId, userId } = params;

    // 1. Знаходимо воркспейс
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new Error('Робочий простір не знайдено');
    }

    // 2. Перевірка прав (тільки власник може видалити)
    if (!workspace.isOwner(userId)) {
      throw new Error('Тільки власник може видалити цей робочий простір');
    }

    // 3. Виконуємо м'яке видалення
    await this.workspaceRepository.softDelete(workspaceId);
  }
}
