import { injectable, inject } from "tsyringe";
import { Contact } from "@/backend/domain/entities/contact.entity";
import { ContactType } from "@/backend/domain/value-objects/contact-type.enum";
import { Individual } from "@/backend/domain/entities/individual.entity";
import { Company } from "@/backend/domain/entities/company.entity";
import {
  EntityNotFoundError,
  DuplicateEntityError,
  ImmutableFieldUpdateError,
  MissingRequiredFieldError,
} from "@/backend/domain/errors/invalid-data.error";
import type { IContactRepository } from "@/backend/application/interfaces/repositories/contact.repository.interface";
import type { SaveContactDTO } from "@/backend/application/dtos/contacts/save-contact.dto";

/**
 * Універсальний Use Case для збереження контакту.
 * Сама вирішує, чи це нова сутність, чи оновлення, і який тип (Individual/Company).
 */
@injectable()
export class SaveContactUseCase {
  constructor(
    @inject("IContactRepository")
    private readonly contactRepository: IContactRepository,
  ) {}

  async execute(
    dto: SaveContactDTO,
  ): Promise<{ contact: Contact; details: Individual | Company }> {
    const isUpdate = !!dto.id;
    let contact: Contact;
    let details: Individual | Company;

    if (isUpdate) {
      // 1. Логіка оновлення
      const existingContact = await this.contactRepository.findById(dto.id!);
      if (!existingContact) throw new EntityNotFoundError("Контакт", dto.id!);

      // ЗАБОРОНА зміни типу контакту
      if (dto.contactType && dto.contactType !== existingContact.contactType) {
        throw new ImmutableFieldUpdateError("Тип контакту");
      }

      // Перевірка унікальності Email при оновленні (ігноруємо видалені)
      if (dto.email && dto.email !== existingContact.email) {
        const isDuplicate = await this.contactRepository.existsByEmail(
          existingContact.workspaceId,
          dto.email,
          existingContact.id,
        );
        if (isDuplicate)
          throw new DuplicateEntityError("Контакт", "Email", dto.email);
      }

      // Перевірка унікальності Телефону при оновленні (ігноруємо видалені)
      if (dto.phone && dto.phone !== existingContact.phone) {
        const isDuplicate = await this.contactRepository.existsByPhone(
          existingContact.workspaceId,
          dto.phone,
          existingContact.id,
        );
        if (isDuplicate)
          throw new DuplicateEntityError(
            "Контакт",
            "номер телефону",
            dto.phone,
          );
      }

      contact = existingContact;
      contact.update({
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        notes: dto.notes,
        tags: dto.tags,
      });

      if (contact.contactType === ContactType.INDIVIDUAL) {
        const existingInd =
          await this.contactRepository.findIndividualByContactId(dto.id!);
        if (!existingInd)
          throw new EntityNotFoundError("Профіль фізичної особи", dto.id!);

        // Перевірка унікальності ІПН при оновленні (ігноруємо видалені)
        if (dto.taxNumber && dto.taxNumber !== existingInd.taxNumber) {
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

        details = existingInd;
        details.update({
          firstName: dto.firstName,
          lastName: dto.lastName,
          middleName: dto.middleName,
          dateOfBirth: dto.dateOfBirth,
          taxNumber: dto.taxNumber,
          passportDetails: dto.passportDetails,
        });
      } else {
        const existingComp =
          await this.contactRepository.findCompanyByContactId(dto.id!);
        if (!existingComp)
          throw new EntityNotFoundError("Профіль компанії", dto.id!);

        // Перевірка унікальності ЄДРПОУ при оновленні (ігноруємо видалені)
        if (dto.taxId && dto.taxId !== existingComp.taxId) {
          const isDuplicate = await this.contactRepository.existsByTaxId(
            contact.workspaceId,
            dto.taxId,
            contact.id,
          );
          if (isDuplicate)
            throw new DuplicateEntityError("Компанія", "ЄДРПОУ", dto.taxId);
        }

        details = existingComp;
        details.update({
          name: dto.companyName,
          taxId: dto.taxId,
        });
      }
    } else {
      // 2. Логіка створення

      // Валідація обов'язкових полів перед створенням
      if (dto.contactType === ContactType.INDIVIDUAL) {
        if (!dto.firstName) throw new MissingRequiredFieldError("Ім’я");
        if (!dto.lastName) throw new MissingRequiredFieldError("Прізвище");

        if (dto.taxNumber) {
          const isDuplicate = await this.contactRepository.existsByTaxNumber(
            dto.workspaceId,
            dto.taxNumber,
          );
          if (isDuplicate)
            throw new DuplicateEntityError(
              "Фізична особа",
              "ІПН",
              dto.taxNumber,
            );
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

      // Перевірка унікальності Email при створенні (ігноруємо видалені)
      if (dto.email) {
        const isDuplicate = await this.contactRepository.existsByEmail(
          dto.workspaceId,
          dto.email,
        );
        if (isDuplicate)
          throw new DuplicateEntityError("Контакт", "Email", dto.email);
      }

      // Перевірка унікальності Телефону при створенні (ігноруємо видалені)
      if (dto.phone) {
        const isDuplicate = await this.contactRepository.existsByPhone(
          dto.workspaceId,
          dto.phone,
        );
        if (isDuplicate)
          throw new DuplicateEntityError(
            "Контакт",
            "номер телефону",
            dto.phone,
          );
      }

      contact = Contact.create({
        workspaceId: dto.workspaceId,
        contactType: dto.contactType,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        notes: dto.notes,
        tags: dto.tags,
        createdBy: dto.createdBy,
      });

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
    }

    // 3. Збереження в БД (транзакційно)
    await this.contactRepository.saveFullContact(contact, details);

    return { contact, details };
  }
}
