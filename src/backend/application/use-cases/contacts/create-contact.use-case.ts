import { injectable, inject } from "tsyringe";
import { Contact } from "@/backend/domain/entities/contact.entity";
import { ContactType } from "@/backend/domain/value-objects/contact-type.enum";
import { Individual } from "@/backend/domain/entities/individual.entity";
import { Company } from "@/backend/domain/entities/company.entity";
import {
  DuplicateEntityError,
  MissingRequiredFieldError,
} from "@/backend/domain/errors/invalid-data.error";
import type { IContactRepository } from "@/backend/application/interfaces/repositories/contact.repository.interface";
import type { CreateContactDTO } from "@/backend/application/dtos/contacts/create-contact.dto";
// import { ContactCreatedEvent } from "@/backend/domain/events/contact.events";
// import { eventDispatcher } from "@/backend/infrastructure/events/event-dispatcher";

/**
 * Use Case для створення нового контакту.
 */
@injectable()
export class CreateContactUseCase {
  constructor(
    @inject("IContactRepository")
    private readonly contactRepository: IContactRepository,
  ) {}

  async execute(
    dto: CreateContactDTO,
  ): Promise<{ contact: Contact; details: Individual | Company }> {
    // 1. Валідація обов'язкових полів залежно від типу
    if (dto.contactType === ContactType.INDIVIDUAL) {
      if (!dto.firstName) throw new MissingRequiredFieldError("Ім’я");
      if (!dto.lastName) throw new MissingRequiredFieldError("Прізвище");

      if (dto.taxNumber) {
        const isDuplicate = await this.contactRepository.existsByTaxNumber(
          dto.workspaceId,
          dto.taxNumber,
        );
        if (isDuplicate)
          throw new DuplicateEntityError("Фізична особа", "ІПН", dto.taxNumber);
      }
    } else {
      if (!dto.companyName)
        throw new MissingRequiredFieldError("Назва компанії");

      if (dto.taxId) {
        const isDuplicate = await this.contactRepository.existsByTaxId(
          dto.workspaceId,
          dto.taxId,
        );
        if (isDuplicate)
          throw new DuplicateEntityError("Компанія", "ЄДРПОУ", dto.taxId);
      }
    }

    // 2. Перевірка унікальності Email (ігноруємо видалені)
    if (dto.email) {
      const isDuplicate = await this.contactRepository.existsByEmail(
        dto.workspaceId,
        dto.email,
      );
      if (isDuplicate)
        throw new DuplicateEntityError("Контакт", "Email", dto.email);
    }

    // 3. Перевірка унікальності телефону
    if (dto.phone) {
      const isDuplicate = await this.contactRepository.existsByPhone(
        dto.workspaceId,
        dto.phone,
      );
      if (isDuplicate)
        throw new DuplicateEntityError("Контакт", "номер телефону", dto.phone);
    }

    // 4. Створення сутностей
    const contact = Contact.create({
      workspaceId: dto.workspaceId,
      contactType: dto.contactType,
      email: dto.email,
      phone: dto.phone,
      address: dto.address,
      notes: dto.notes,
      tags: dto.tags,
      createdBy: dto.createdBy,
    });

    let details: Individual | Company;

    if (dto.contactType === ContactType.INDIVIDUAL) {
      details = Individual.create({
        contactId: contact.id,
        firstName: dto.firstName!,
        lastName: dto.lastName!,
        middleName: dto.middleName,
        dateOfBirth: dto.dateOfBirth,
        taxNumber: dto.taxNumber,
        passportDetails: dto.passportDetails,
      });
    } else {
      details = Company.create({
        contactId: contact.id,
        name: dto.companyName!,
        taxId: dto.taxId,
      });
    }

    // 5. Збереження в БД (транзакційно)
    await this.contactRepository.saveFullContact(contact, details);

    // const event = new ContactCreatedEvent(
    //   contact.id,
    //   contact.workspaceId,
    //   contact.contactType,
    //   contact.createdBy,
    // );

    // // 3. Відправка події (важливо await, щоб Server Action не вмер завчасно)
    // await eventDispatcher.dispatch(event);

    return { contact, details };
  }
}
