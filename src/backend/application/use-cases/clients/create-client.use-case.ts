import { injectable, inject } from "tsyringe";
import { Client } from "@/backend/domain/entities/client.entity";
import { ClientType } from "@/backend/domain/value-objects/client-type.enum";
import { Individual } from "@/backend/domain/entities/individual.entity";
import { Company } from "@/backend/domain/entities/company.entity";
import {
  DuplicateEntityError,
  MissingRequiredFieldError,
} from "@/backend/domain/errors/invalid-data.error";
import type { IClientRepository } from "@/backend/application/interfaces/repositories/client.repository.interface";
import type { CreateClientDTO } from "@/backend/application/dtos/clients/create-client.dto";

/**
 * Use Case для створення нового клієнта.
 */
@injectable()
export class CreateClientUseCase {
  constructor(
    @inject("IClientRepository")
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(
    dto: CreateClientDTO,
  ): Promise<{ client: Client; details: Individual | Company }> {
    const entityName = dto.clientType === ClientType.INDIVIDUAL ? "Фізична особа" : "Компанія";

    // 1. Валідація обов'язкових полів залежно від типу
    if (dto.clientType === ClientType.INDIVIDUAL) {
      if (!dto.firstName) throw new MissingRequiredFieldError("Ім’я");
      if (!dto.lastName) throw new MissingRequiredFieldError("Прізвище");

      if (dto.taxNumber) {
        const isDuplicate = await this.clientRepository.existsByTaxNumber(
          dto.workspaceId,
          dto.taxNumber,
        );
        if (isDuplicate)
          throw new DuplicateEntityError(
            entityName,
            "РНОКПП",
            dto.taxNumber,
            "taxNumber",
          );
      }
    } else {
      if (!dto.companyName)
        throw new MissingRequiredFieldError("Назва компанії");

      if (dto.taxId) {
        const isDuplicate = await this.clientRepository.existsByTaxId(
          dto.workspaceId,
          dto.taxId,
        );
        if (isDuplicate)
          throw new DuplicateEntityError(
            entityName,
            "ЄДРПОУ",
            dto.taxId,
            "taxId",
          );
      }
    }

    // 2. Перевірка унікальності Email (ігноруємо видалені)
    if (dto.email) {
      const isDuplicate = await this.clientRepository.existsByEmail(
        dto.workspaceId,
        dto.email,
      );
      if (isDuplicate)
        throw new DuplicateEntityError(entityName, "Email", dto.email, "email");
    }

    // 3. Перевірка унікальності телефону
    if (dto.phone) {
      const isDuplicate = await this.clientRepository.existsByPhone(
        dto.workspaceId,
        dto.phone,
      );
      if (isDuplicate)
        throw new DuplicateEntityError(
          entityName,
          "номером телефону",
          dto.phone,
          "phone",
        );
    }

    // 4. Створення сутностей
    const client = Client.create({
      workspaceId: dto.workspaceId,
      clientType: dto.clientType,
      email: dto.email,
      phone: dto.phone,
      address: dto.address,
      note: dto.note,
      createdBy: dto.createdBy,
    });

    let details: Individual | Company;

    if (dto.clientType === ClientType.INDIVIDUAL) {
      details = Individual.create({
        clientId: client.id,
        firstName: dto.firstName!,
        lastName: dto.lastName!,
        middleName: dto.middleName,
        dateOfBirth: dto.dateOfBirth,
        taxNumber: dto.taxNumber,
        isFop: dto.isFop,
        passportDetails: dto.passportDetails,
      });
    } else {
      details = Company.create({
        clientId: client.id,
        name: dto.companyName!,
        taxId: dto.taxId,
      });
    }

    // 5. Збереження в БД (транзакційно)
    await this.clientRepository.saveFullClient(client, details);

    return { client, details };
  }
}
