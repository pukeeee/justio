import { injectable, inject } from "tsyringe";
import type { IClientRepository } from "@/backend/application/interfaces/repositories/client.repository.interface";

/**
 * Use Case: Остаточне (жорстке) видалення контакту з бази даних.
 */
@injectable()
export class HardDeleteClientUseCase {
  constructor(
    @inject("IClientRepository")
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(clientId: string, workspaceId: string): Promise<void> {
    await this.clientRepository.hardDelete(clientId, workspaceId);
  }
}
