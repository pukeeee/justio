import { injectable, inject } from 'tsyringe';
import type { IContactRepository, FindAllContactsOptions } from '@/backend/application/interfaces/repositories/contact.repository.interface';
import type { ContactListItemDTO } from '@/backend/application/dtos/contacts/contact-list-item.dto';
import { PAGINATION_CONFIG } from '@/backend/infrastructure/config/pagination.config';

export interface GetContactsListResponse {
  items: ContactListItemDTO[];
  total: number;
}

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
