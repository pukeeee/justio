import { injectable, inject } from "tsyringe";
import { Contact } from "@/backend/domain/entities/contact.entity";
import { ContactType } from "@/backend/domain/value-objects/contact-type.enum";
import { Individual } from "@/backend/domain/entities/individual.entity";
import { Company } from "@/backend/domain/entities/company.entity";
import {
  EntityNotFoundError,
  DuplicateEntityError,
} from "@/backend/domain/errors/invalid-data.error";
import type { IContactRepository } from "@/backend/application/interfaces/repositories/contact.repository.interface";
import type { UpdateContactDTO } from "@/backend/application/dtos/contacts/update-contact.dto";

/**
 * Use Case для оновлення існуючого контакту.
 */
@injectable()
export class UpdateContactUseCase {
  constructor(
    @inject("IContactRepository")
    private readonly contactRepository: IContactRepository,
  ) {}

  async execute(
    dto: UpdateContactDTO,
  ): Promise<{ contact: Contact; details: Individual | Company }> {
    // 1. Пошук існуючого контакту
    const contact = await this.contactRepository.findById(dto.id);
    if (!contact) throw new EntityNotFoundError("Контакт", dto.id);

    // 2. Перевірка унікальності Email при оновленні
    if (dto.email && dto.email !== contact.email) {
      const isDuplicate = await this.contactRepository.existsByEmail(
        contact.workspaceId,
        dto.email,
        contact.id,
      );
      if (isDuplicate)
        throw new DuplicateEntityError("Контакт", "Email", dto.email);
    }

    // 3. Перевірка унікальності Телефону при оновленні
    if (dto.phone && dto.phone !== contact.phone) {
      const isDuplicate = await this.contactRepository.existsByPhone(
        contact.workspaceId,
        dto.phone,
        contact.id,
      );
      if (isDuplicate)
        throw new DuplicateEntityError(
          "Контакт",
          "номер телефону",
          dto.phone,
        );
    }

    // Оновлення базових полів контакту
    contact.update({
      email: dto.email,
      phone: dto.phone,
      address: dto.address,
      notes: dto.notes,
      tags: dto.tags,
    });

    let details: Individual | Company;

    if (contact.contactType === ContactType.INDIVIDUAL) {
      const individual =
        await this.contactRepository.findIndividualByContactId(dto.id);
      if (!individual)
        throw new EntityNotFoundError("Профіль фізичної особи", dto.id);

      // Перевірка унікальності ІПН
      if (dto.taxNumber && dto.taxNumber !== individual.taxNumber) {
        const isDuplicate = await this.contactRepository.existsByTaxNumber(
          contact.workspaceId,
          dto.taxNumber,
          contact.id,
        );
        if (isDuplicate)
          throw new DuplicateEntityError(
            "Фізична особа",
            "ІПН",
            dto.taxNumber,
          );
      }

      individual.update({
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName,
        dateOfBirth: dto.dateOfBirth,
        taxNumber: dto.taxNumber,
        passportDetails: dto.passportDetails,
      });
      details = individual;
    } else {
      const company = await this.contactRepository.findCompanyByContactId(
        dto.id,
      );
      if (!company) throw new EntityNotFoundError("Профіль компанії", dto.id);

      // Перевірка унікальності ЄДРПОУ
      if (dto.taxId && dto.taxId !== company.taxId) {
        const isDuplicate = await this.contactRepository.existsByTaxId(
          contact.workspaceId,
          dto.taxId,
          contact.id,
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
    await this.contactRepository.saveFullContact(contact, details);

    return { contact, details };
  }
}
