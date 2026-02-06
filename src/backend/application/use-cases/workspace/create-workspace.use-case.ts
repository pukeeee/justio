import { injectable, inject } from 'tsyringe';
import { Workspace } from '@/backend/domain/entities/workspace.entity';
import { WorkspaceSlug } from '@/backend/domain/value-objects/workspace-slug.vo';
import type { IWorkspaceRepository } from '@/backend/application/interfaces/repositories/workspace.repository.interface';

/**
 * Юзкейс для створення нового робочого простору.
 */
@injectable()
export class CreateWorkspaceUseCase {
  constructor(
    @inject('IWorkspaceRepository')
    private readonly workspaceRepository: IWorkspaceRepository
  ) {}

  async execute(params: { name: string; userId: string }): Promise<Workspace> {
    const { name, userId } = params;

    // 1. Валідація назви (бізнес-правила)
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      throw new Error('Назва воркспейсу має бути від 2 до 100 символів');
    }

    // 2. Генерація унікального слага через Domain Value Object
    let slugVo = WorkspaceSlug.generate();
    
    // Перевірка на конфлікт слагів (хоча шанс мінімальний)
    let existing = await this.workspaceRepository.findBySlug(slugVo.value);
    while (existing) {
      slugVo = WorkspaceSlug.generate();
      existing = await this.workspaceRepository.findBySlug(slugVo.value);
    }

    // 3. Створення сутності
    const workspace = Workspace.create({
      name: trimmedName,
      slug: slugVo,
      ownerId: userId,
    });

    // 4. Збереження
    await this.workspaceRepository.save(workspace);

    return workspace;
  }
}
