import { injectable, inject } from 'tsyringe';
import { Workspace } from '@/backend/domain/entities/workspace.entity';
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

    // 2. Генерація слага (рандомний ідентифікатор)
    let slug = this.generateSlug();
    
    // Перевірка на конфлікт слагів (хоча шанс мінімальний)
    let existing = await this.workspaceRepository.findBySlug(slug);
    while (existing) {
      slug = this.generateSlug();
      existing = await this.workspaceRepository.findBySlug(slug);
    }

    // 3. Створення сутності
    const workspace = Workspace.create({
      name: trimmedName,
      slug: slug,
      ownerId: userId,
    });

    // 4. Збереження
    await this.workspaceRepository.save(workspace);

    return workspace;
  }

  /**
   * Генерує рандомний короткий ідентифікатор для слага.
   * Використовує алфавітно-цифрові символи.
   */
  private generateSlug(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const length = 10;
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
