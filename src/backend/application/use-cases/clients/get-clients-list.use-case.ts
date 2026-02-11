import { injectable, inject } from "tsyringe";
import type { IClientRepository } from "@/backend/application/interfaces/repositories/client.repository.interface";
import { FindAllClientsOptions } from "@/backend/application/dtos/clients/find-clients-query.dto";
import { GetClientsListResponse } from "@/backend/application/dtos/clients/get-clients-list-response.dto";
import { PAGINATION_CONFIG } from "@/backend/infrastructure/config/pagination.config";

/**
 * Use Case: Отримання списку клієнтів для конкретного воркспейсу.
 */
@injectable()
export class GetClientsListUseCase {
  constructor(
    @inject("IClientRepository")
    private readonly clientRepository: IClientRepository,
  ) {}

  /**
   * Повертає список клієнтів з метаданими пагінації.
   */
  async execute(
    workspaceId: string,
    options: FindAllClientsOptions,
  ): Promise<GetClientsListResponse> {
    const limit = options.limit ?? PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
    const offset = options.offset ?? 0;

    const [items, total] = await Promise.all([
      this.clientRepository.findAllByWorkspaceId(workspaceId, {
        ...options,
        limit,
        offset,
      }),
      this.clientRepository.countAllByWorkspaceId(workspaceId, options),
    ]);

    return { items, total };
  }
}
