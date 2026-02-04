import { injectable, inject } from 'tsyringe';
import type { IContactRepository } from '@/backend/application/interfaces/repositories/contact.repository.interface';
import { FindAllContactsOptions } from '@/backend/application/dtos/contacts/find-contacts-query.dto';
import { GetContactsListResponse } from '@/backend/application/dtos/contacts/get-contacts-list-response.dto';
import { PAGINATION_CONFIG } from '@/backend/infrastructure/config/pagination.config';

/**
 * Use Case: Отримання списку контактів для конкретного воркспейсу.
 */
@injectable()
export class GetContactsListUseCase {
  constructor(
    @inject('IContactRepository')
    private readonly contactRepository: IContactRepository
  ) {}

  /**
   * Повертає список контактів з метаданими пагінації.
   */
  async execute(workspaceId: string, options: FindAllContactsOptions): Promise<GetContactsListResponse> {
    const limit = options.limit ?? PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
    const offset = options.offset ?? 0;

    const [items, total] = await Promise.all([
      this.contactRepository.findAllByWorkspaceId(workspaceId, { ...options, limit, offset }),
      this.contactRepository.countAllByWorkspaceId(workspaceId, options)
    ]);

    return { items, total };
  }
}
