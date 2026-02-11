import { injectable, inject } from "tsyringe";
import type { IClientRepository } from "@/backend/application/interfaces/repositories/client.repository.interface";

/**
 * Use Case: Відновлення клієнта з кошика.
 */
@injectable()
export class RestoreClientUseCase {
  constructor(
    @inject("IClientRepository")
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(clientId: string, workspaceId: string): Promise<void> {
    await this.clientRepository.restore(clientId, workspaceId);
  }
}
