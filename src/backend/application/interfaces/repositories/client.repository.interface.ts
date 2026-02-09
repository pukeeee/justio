import { Client } from "@/backend/domain/entities/client.entity";
import { Individual } from "@/backend/domain/entities/individual.entity";
import { Company } from "@/backend/domain/entities/company.entity";
import { ClientListItemDTO } from "@/backend/application/dtos/clients/client-list-item.dto";
import { CompanyContact } from "@/backend/domain/entities/company-contact.entity";
import { CompanyContactRole } from "@/backend/domain/value-objects/company-contact-role.enum";
import { FindAllClientsOptions } from "@/backend/application/dtos/clients/find-clients-query.dto";

/**
 * Інтерфейс для роботи з клієнтами.
 */
export interface IClientRepository {
  /**
   * Отримати список усіх клієнтів з пагінацією та пошуком.
   */
  findAllByWorkspaceId(
    workspaceId: string,
    options: FindAllClientsOptions,
  ): Promise<ClientListItemDTO[]>;

  /**
   * Отримати загальну кількість клієнтів (для пагінації).
   */
  countAllByWorkspaceId(
    workspaceId: string,
    options: FindAllClientsOptions,
  ): Promise<number>;

  /**
   * Знайти базовий клієнт за ID.
   */
  findById(id: string): Promise<Client | null>;

  /**
   * Знайти повну інформацію про фізичну особу.
   */
  findIndividualByClientId(contactId: string): Promise<Individual | null>;

  /**
   * Знайти повну інформацію про компанію.
   */
  findCompanyByClientId(contactId: string): Promise<Company | null>;

  /**
   * Атомарне збереження клієнту та його деталей (транзакційно).
   */
  saveFullClient(client: Client, details: Individual | Company): Promise<void>;

  /**
   * Атомарне оновлення клієнту та його деталей (транзакційно).
   */
  updateFullClient(
    client: Client,
    details: Individual | Company,
  ): Promise<void>;

  /**
   * М'яке видалення клієнту.
   */
  softDelete(id: string): Promise<void>;

  /**
   * Відновлення видаленого клієнту.
   */
  restore(id: string): Promise<void>;

  /**
   * Перевірити, чи існує фізична особа з таким РНОКПП у воркспейсі.
   */
  existsByTaxNumber(
    workspaceId: string,
    taxNumber: string,
    excludeClientId?: string,
  ): Promise<boolean>;

  /**
   * Перевірити, чи існує компанія з таким ЄДРПОУ у воркспейсі.
   */
  existsByTaxId(
    workspaceId: string,
    taxId: string,
    excludeClientId?: string,
  ): Promise<boolean>;

  /**
   * Перевірити, чи існує клієнт з таким email у воркспейсі.
   */
  existsByEmail(
    workspaceId: string,
    email: string,
    excludeClientId?: string,
  ): Promise<boolean>;

  /**
   * Перевірити, чи існує клієнт з таким номером телефону у воркспейсі.
   */
  existsByPhone(
    workspaceId: string,
    phone: string,
    excludeClientId?: string,
  ): Promise<boolean>;

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
  updateCompanyContactRole(
    companyId: string,
    individualId: string,
    role: CompanyContactRole,
  ): Promise<void>;

  /**
   * Отримати всіх контактних осіб компанії.
   */
  findCompanyContacts(
    companyId: string,
  ): Promise<{ individual: Individual; role: CompanyContactRole }[]>;

  /**
   * Перевіряє, чи є користувач власником клієнту (поле createdBy).
   */
  isOwner(clientId: string, userId: string): Promise<boolean>;
}
