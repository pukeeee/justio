import { Contact } from '@/backend/domain/entities/contact.entity';
import { Individual } from '@/backend/domain/entities/individual.entity';
import { Company } from '@/backend/domain/entities/company.entity';
import { ContactListItemDTO } from '@/backend/application/dtos/contacts/contact-list-item.dto';
import { CompanyContact, CompanyContactRole } from '@/backend/domain/entities/company-contact.entity';

export interface FindAllContactsOptions {
  limit?: number;
  offset?: number;
  search?: string;
  onlyDeleted?: boolean;
}

/**
 * Інтерфейс для роботи з контактами.
 */
export interface IContactRepository {
  /**
   * Отримати список усіх контактів з пагінацією та пошуком.
   */
  findAllByWorkspaceId(workspaceId: string, options: FindAllContactsOptions): Promise<ContactListItemDTO[]>;

  /**
   * Отримати загальну кількість контактів (для пагінації).
   */
  countAllByWorkspaceId(workspaceId: string, options: FindAllContactsOptions): Promise<number>;

  /**
   * Знайти базовий контакт за ID.
   */
  findById(id: string): Promise<Contact | null>;

  /**
   * Знайти повну інформацію про фізичну особу.
   */
  findIndividualByContactId(contactId: string): Promise<Individual | null>;

  /**
   * Знайти повну інформацію про компанію.
   */
  findCompanyByContactId(contactId: string): Promise<Company | null>;

  /**
   * Атомарне збереження контакту та його деталей (транзакційно).
   */
  saveFullContact(contact: Contact, details: Individual | Company): Promise<void>;

  /**
   * М'яке видалення контакту.
   */
  softDelete(id: string): Promise<void>;

  /**
   * Відновлення видаленого контакту.
   */
  restore(id: string): Promise<void>;

  /**
   * Перевірити, чи існує фізична особа з таким ІПН (РНОКПП) у воркспейсі.
   */
  existsByTaxNumber(workspaceId: string, taxNumber: string, excludeContactId?: string): Promise<boolean>;

  /**
   * Перевірити, чи існує компанія з таким ЄДРПОУ у воркспейсі.
   */
  existsByTaxId(workspaceId: string, taxId: string, excludeContactId?: string): Promise<boolean>;

  /**
   * Перевірити, чи існує контакт з таким email у воркспейсі.
   */
  existsByEmail(workspaceId: string, email: string, excludeContactId?: string): Promise<boolean>;

  /**
   * Перевірити, чи існує контакт з таким номером телефону у воркспейсі.
   */
  existsByPhone(workspaceId: string, phone: string, excludeContactId?: string): Promise<boolean>;

  /**
   * Повне видалення з бази даних.
   */
  hardDelete(id: string): Promise<void>;

  /**
   * Додати контактну особу до компанії.
   */
  addCompanyContact(link: CompanyContact): Promise<void>;

  /**
   * Видалити зв'язок між компанією та фізичною особою.
   */
  removeCompanyContact(companyId: string, individualId: string): Promise<void>;

  /**
   * Оновити роль контактної особи в компанії.
   */
  updateCompanyContactRole(companyId: string, individualId: string, role: CompanyContactRole): Promise<void>;

  /**
   * Отримати всіх контактних осіб компанії.
   */
  findCompanyContacts(companyId: string): Promise<{ individual: Individual; role: CompanyContactRole }[]>;

  /**
   * Перевіряє, чи є користувач власником контакту (поле createdBy).
   */
  isOwner(contactId: string, userId: string): Promise<boolean>;
}
