import { injectable, inject } from "tsyringe";
import type { IClientRepository } from "@/backend/application/interfaces/repositories/client.repository.interface";
import type { ClientDetailsDTO } from "@/backend/application/dtos/clients/client-details.dto";
import { EntityNotFoundError } from "@/backend/domain/errors/invalid-data.error";
import { ClientType } from "@/backend/domain/value-objects/client-type.enum";

/**
 * Use Case: Отримання повної інформації про контакт за його ID.
 */
@injectable()
export class GetClientDetailsUseCase {
  constructor(
    @inject("IClientRepository")
    private readonly clientRepository: IClientRepository,
  ) {}

  /**
   * Завантажує базового клієнта та його специфічний профіль.
   */
  async execute(contactId: string): Promise<ClientDetailsDTO> {
    // 1. Отримуємо базового клієнта
    const client = await this.clientRepository.findById(contactId);
    if (!client) throw new EntityNotFoundError("Клієнт", contactId);

    let individual = null;
    let company = null;

    // 2. Завантажуємо деталі залежно від типу
    if (client.clientType === ClientType.INDIVIDUAL) {
      individual =
        await this.clientRepository.findIndividualByClientId(contactId);
    } else {
      company = await this.clientRepository.findCompanyByClientId(contactId);
    }

    return { client, individual, company };
  }
}
