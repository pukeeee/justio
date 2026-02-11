import { injectable, inject } from "tsyringe";
import type { IClientRepository } from "@/backend/application/interfaces/repositories/client.repository.interface";

/**
 * Use Case: М'яке видалення контакту (переміщення в кошик).
 */
@injectable()
export class DeleteClientUseCase {
  constructor(
    @inject("IClientRepository")
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(clientId: string, workspaceId: string): Promise<void> {
    await this.clientRepository.softDelete(clientId, workspaceId);
  }
}
