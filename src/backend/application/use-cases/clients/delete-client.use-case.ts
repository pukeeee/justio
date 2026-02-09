import { injectable, inject } from "tsyringe";
import type { IClientRepository } from "@/backend/application/interfaces/repositories/client.repository.interface";

/**
 * Use Case: М'яке видалення контакту (переміщення в кошик).
 */
@injectable()
export class DeleteClientUseCase {
  constructor(
    @inject("IContactRepository")
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(contactId: string): Promise<void> {
    await this.clientRepository.softDelete(contactId);
  }
}
