import { injectable, inject } from "tsyringe";
import { Client } from "@/backend/domain/entities/client.entity";
import { ClientType } from "@/backend/domain/value-objects/client-type.enum";
import { Individual } from "@/backend/domain/entities/individual.entity";
import { Company } from "@/backend/domain/entities/company.entity";
import {
  EntityNotFoundError,
  DuplicateEntityError,
} from "@/backend/domain/errors/invalid-data.error";
import type { IClientRepository } from "@/backend/application/interfaces/repositories/client.repository.interface";
import type { UpdateClientDTO } from "@/backend/application/dtos/clients/update-client.dto";

/**
 * Use Case для оновлення існуючого клієнта.
 */
@injectable()
export class UpdateClientUseCase {
  constructor(
    @inject("IClientRepository")
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(
    dto: UpdateClientDTO,
  ): Promise<{ client: Client; details: Individual | Company }> {
    // 1. Пошук існуючого клієнта
    const client = await this.clientRepository.findById(dto.id);
    if (!client) throw new EntityNotFoundError("Клієнт", dto.id);

    // 2. Перевірка унікальності Email при оновленні
    if (dto.email && dto.email !== client.email) {
      const isDuplicate = await this.clientRepository.existsByEmail(
        client.workspaceId,
        dto.email,
        client.id,
      );
      if (isDuplicate)
        throw new DuplicateEntityError("Клієнт", "Email", dto.email);
    }

    // 3. Перевірка унікальності Телефону при оновленні
    if (dto.phone && dto.phone !== client.phone) {
      const isDuplicate = await this.clientRepository.existsByPhone(
        client.workspaceId,
        dto.phone,
        client.id,
      );
      if (isDuplicate)
        throw new DuplicateEntityError("Клієнт", "номер телефону", dto.phone);
    }

    // Оновлення базових полів клієнта
    client.update({
      email: dto.email,
      phone: dto.phone,
      address: dto.address,
      note: dto.note,
    });

    let details: Individual | Company;

    if (client.clientType === ClientType.INDIVIDUAL) {
      const individual = await this.clientRepository.findIndividualByClientId(
        dto.id,
      );
      if (!individual)
        throw new EntityNotFoundError("Профіль фізичної особи", dto.id);

      // Перевірка унікальності ІПН
      if (dto.taxNumber && dto.taxNumber !== individual.taxNumber) {
        const isDuplicate = await this.clientRepository.existsByTaxNumber(
          client.workspaceId,
          dto.taxNumber,
          client.id,
        );
        if (isDuplicate)
          throw new DuplicateEntityError("Фізична особа", "ІПН", dto.taxNumber);
      }

      individual.update({
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName,
        dateOfBirth: dto.dateOfBirth,
        taxNumber: dto.taxNumber,
        isFop: dto.isFop,
        passportDetails: dto.passportDetails,
      });
      details = individual;
    } else {
      const company = await this.clientRepository.findCompanyByClientId(dto.id);
      if (!company) throw new EntityNotFoundError("Профіль компанії", dto.id);

      // Перевірка унікальності ЄДРПОУ
      if (dto.taxId && dto.taxId !== company.taxId) {
        const isDuplicate = await this.clientRepository.existsByTaxId(
          client.workspaceId,
          dto.taxId,
          client.id,
        );
        if (isDuplicate)
          throw new DuplicateEntityError("Компанія", "ЄДРПОУ", dto.taxId);
      }

      company.update({
        name: dto.companyName,
        taxId: dto.taxId,
      });
      details = company;
    }

    // 4. Збереження в БД (транзакційно)
    await this.clientRepository.saveFullClient(client, details);

    return { client, details };
  }
}
