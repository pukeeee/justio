import { injectable } from "tsyringe";
import {
  eq,
  and,
  isNull,
  desc,
  or,
  ilike,
  count,
  isNotNull,
  ne,
  sql,
} from "drizzle-orm";
import { db } from "../drizzle/client";
import {
  clients,
  individuals,
  companies,
  companyContacts,
} from "../drizzle/schema";
import { Client } from "@/backend/domain/entities/client.entity";
import { Individual } from "@/backend/domain/entities/individual.entity";
import { Company } from "@/backend/domain/entities/company.entity";
import { CompanyContact } from "@/backend/domain/entities/company-contact.entity";
import { ClientType } from "@/backend/domain/value-objects/client-type.enum";
import { CompanyContactRole } from "@/backend/domain/value-objects/company-contact-role.enum";
import { IClientRepository } from "@/backend/application/interfaces/repositories/client.repository.interface";
import { FindAllClientsOptions } from "@/backend/application/dtos/clients/find-clients-query.dto";
import { EntityNotFoundError } from "@/backend/domain/errors/invalid-data.error";
import { ClientMapper } from "../mappers/client.mapper";
import { IndividualMapper } from "../mappers/individual.mapper";
import { CompanyMapper } from "../mappers/company.mapper";
import { ClientListItemDTO } from "@/backend/application/dtos/clients/client-list-item.dto";

@injectable()
export class DrizzleClientRepository implements IClientRepository {
  /**
   * Знайти базовий контакт за ID.
   */
  async findById(id: string): Promise<Client | null> {
    const [row] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);

    if (!row) return null;

    return ClientMapper.toDomain(row);
  }

  /**
   * Знайти фізичну особу за її контактним ID.
   */
  async findIndividualByClientId(clientId: string): Promise<Individual | null> {
    const [row] = await db
      .select()
      .from(individuals)
      .where(eq(individuals.clientId, clientId))
      .limit(1);

    if (!row) return null;

    // Drizzle повертає дату як рядок для типу 'date', мапер це обробить
    return IndividualMapper.toDomain(row);
  }

  /**
   * Знайти компанію за її контактним ID.
   */
  async findCompanyByClientId(clientId: string): Promise<Company | null> {
    const [row] = await db
      .select()
      .from(companies)
      .where(eq(companies.clientId, clientId))
      .limit(1);

    if (!row) return null;

    return CompanyMapper.toDomain(row);
  }

  /**
   * Атомарне оновлення клієнта та його деталей через транзакцію.
   */
  async updateFullClient(
    client: Client,
    details: Individual | Company,
  ): Promise<void> {
    const clientData = ClientMapper.toPersistence(client);
    clientData.updatedAt = new Date();

    await db.transaction(async (tx) => {
      // 1. Оновлюємо базовий контакт
      const [updatedClient] = await tx
        .update(clients)
        .set({
          email: clientData.email,
          phone: clientData.phone,
          address: clientData.address,
          note: clientData.note,
          updatedAt: clientData.updatedAt,
        })
        .where(eq(clients.id, client.id))
        .returning();

      if (!updatedClient) {
        throw new EntityNotFoundError("Клієнт", client.id);
      }

      // 2. Оновлюємо деталі залежно від типу
      if (details instanceof Individual) {
        const indData = IndividualMapper.toPersistence(details);

        const [updatedInd] = await tx
          .update(individuals)
          .set({
            firstName: indData.firstName,
            lastName: indData.lastName,
            middleName: indData.middleName,
            dateOfBirth: indData.dateOfBirth,
            taxNumber: indData.taxNumber,
            isFop: indData.isFop,
            passportDetails: indData.passportDetails,
          })
          .where(eq(individuals.id, details.id))
          .returning();

        if (!updatedInd) {
          throw new EntityNotFoundError("Профіль фізичної особи", details.id);
        }
      } else {
        const compData = CompanyMapper.toPersistence(details as Company);
        const [updatedComp] = await tx
          .update(companies)
          .set({
            name: compData.name,
            taxId: compData.taxId,
          })
          .where(eq(companies.id, details.id))
          .returning();

        if (!updatedComp) {
          throw new EntityNotFoundError("Профіль компанії", details.id);
        }
      }
    });
  }

  /**
   * Атомарне збереження через транзакцію.
   */
  async saveFullClient(
    client: Client,
    details: Individual | Company,
  ): Promise<void> {
    const clientData = ClientMapper.toPersistence(client);

    await db.transaction(async (tx) => {
      // 1. Зберігаємо базовий контакт
      await tx.insert(clients).values(clientData).onConflictDoUpdate({
        target: clients.id,
        set: clientData,
      });

      // 2. Зберігаємо деталі залежно від типу
      if (details instanceof Individual) {
        const indData = IndividualMapper.toPersistence(details);
        await tx.insert(individuals).values(indData).onConflictDoUpdate({
          target: individuals.id,
          set: indData,
        });
      } else {
        const compData = CompanyMapper.toPersistence(details as Company);
        await tx.insert(companies).values(compData).onConflictDoUpdate({
          target: companies.id,
          set: compData,
        });
      }
    });
  }

  /**
   * Отримати список контактів з фільтрами, пошуком та пагінацією.
   */
  async findAllByWorkspaceId(
    workspaceId: string,
    options: FindAllClientsOptions,
  ): Promise<ClientListItemDTO[]> {
    const { limit = 20, offset = 0, search, onlyDeleted = false } = options;

    const query = db
      .select({
        id: clients.id,
        clientType: clients.clientType,
        email: clients.email,
        phone: clients.phone,
        createdAt: clients.createdAt,
        firstName: individuals.firstName,
        lastName: individuals.lastName,
        isFop: individuals.isFop,
        taxNumber: individuals.taxNumber,
        companyName: companies.name,
        taxId: companies.taxId,
      })
      .from(clients)
      .leftJoin(individuals, eq(clients.id, individuals.clientId))
      .leftJoin(companies, eq(clients.id, companies.clientId))
      .where(
        and(
          eq(clients.workspaceId, workspaceId),
          onlyDeleted
            ? isNotNull(clients.deletedAt)
            : isNull(clients.deletedAt),
          search
            ? or(
                ilike(individuals.firstName, `%${search}%`),
                ilike(individuals.lastName, `%${search}%`),
                ilike(companies.name, `%${search}%`),
                ilike(clients.email, `%${search}%`),
                ilike(clients.phone, `%${search}%`),
                ilike(individuals.taxNumber, `%${search}%`),
                ilike(companies.taxId, `%${search}%`),
              )
            : undefined,
        ),
      )
      .orderBy(desc(clients.createdAt))
      .limit(limit)
      .offset(offset);

    const result = await query;

    return result.map((row) => ({
      id: row.id,
      clientType: row.clientType as ClientType,
      displayName:
        row.clientType === ClientType.INDIVIDUAL
          ? `${row.lastName} ${row.firstName}`.trim()
          : row.companyName || "Без назви",
      email: row.email,
      phone: row.phone,
      isFop: row.isFop ?? false,
      taxNumber: row.taxNumber,
      taxId: row.taxId,
      createdAt: row.createdAt,
    }));
  }

  /**
   * Підрахунок для пагінації.
   */
  async countAllByWorkspaceId(
    workspaceId: string,
    options: FindAllClientsOptions,
  ): Promise<number> {
    const { search, onlyDeleted = false } = options;

    const [result] = await db
      .select({ value: count() })
      .from(clients)
      .leftJoin(individuals, eq(clients.id, individuals.clientId))
      .leftJoin(companies, eq(clients.id, companies.clientId))
      .where(
        and(
          eq(clients.workspaceId, workspaceId),
          onlyDeleted
            ? isNotNull(clients.deletedAt)
            : isNull(clients.deletedAt),
          search
            ? or(
                ilike(individuals.firstName, `%${search}%`),
                ilike(individuals.lastName, `%${search}%`),
                ilike(companies.name, `%${search}%`),
                ilike(clients.email, `%${search}%`),
                ilike(clients.phone, `%${search}%`),
                ilike(individuals.taxNumber, `%${search}%`),
                ilike(companies.taxId, `%${search}%`),
              )
            : undefined,
        ),
      );

    return result?.value ?? 0;
  }

  /**
   * Перевірка унікальності РНОКПП.
   */
  async existsByTaxNumber(
    workspaceId: string,
    taxNumber: string,
    excludeClientId?: string,
  ): Promise<boolean> {
    const [row] = await db
      .select({ id: individuals.id })
      .from(individuals)
      .innerJoin(clients, eq(individuals.clientId, clients.id))
      .where(
        and(
          eq(clients.workspaceId, workspaceId),
          eq(individuals.taxNumber, taxNumber),
          isNull(clients.deletedAt),
          excludeClientId
            ? ne(individuals.clientId, excludeClientId)
            : undefined,
        ),
      )
      .limit(1);

    return !!row;
  }

  /**
   * Перевірка унікальності ЄДРПОУ.
   */
  async existsByTaxId(
    workspaceId: string,
    taxId: string,
    excludeClientId?: string,
  ): Promise<boolean> {
    const [row] = await db
      .select({ id: companies.id })
      .from(companies)
      .innerJoin(clients, eq(companies.clientId, clients.id))
      .where(
        and(
          eq(clients.workspaceId, workspaceId),
          eq(companies.taxId, taxId),
          isNull(clients.deletedAt),
          excludeClientId ? ne(companies.clientId, excludeClientId) : undefined,
        ),
      )
      .limit(1);

    return !!row;
  }

  /**
   * Перевірка унікальності Email.
   */
  async existsByEmail(
    workspaceId: string,
    email: string,
    excludeClientId?: string,
  ): Promise<boolean> {
    const [row] = await db
      .select({ id: clients.id })
      .from(clients)
      .where(
        and(
          eq(clients.workspaceId, workspaceId),
          eq(clients.email, email.trim().toLowerCase()),
          isNull(clients.deletedAt),
          excludeClientId ? ne(clients.id, excludeClientId) : undefined,
        ),
      )
      .limit(1);

    return !!row;
  }

  /**
   * Перевірка унікальності Телефону.
   */
  async existsByPhone(
    workspaceId: string,
    phone: string,
    excludeClientId?: string,
  ): Promise<boolean> {
    // Нормалізуємо для пошуку (використовуємо наш VO через статик або просто базову очистку)
    const normalizedPhone = phone.replace(/\D/g, "");
    // Оскільки ми зберігаємо в базі з плюсом через Phone.create,
    // пошук має бути гнучким. Для надійності краще нормалізувати перед запитом.

    const [row] = await db
      .select({ id: clients.id })
      .from(clients)
      .where(
        and(
          eq(clients.workspaceId, workspaceId),
          // Шукаємо за частковим збігом цифр, щоб уникнути проблем з форматами
          ilike(clients.phone, `%${normalizedPhone}%`),
          isNull(clients.deletedAt),
          excludeClientId ? ne(clients.id, excludeClientId) : undefined,
        ),
      )
      .limit(1);

    return !!row;
  }

  /**
   * М'яке видалення.
   */
  async softDelete(id: string): Promise<void> {
    await db
      .update(clients)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(clients.id, id));
  }

  /**
   * Відновлення.
   */
  async restore(id: string): Promise<void> {
    await db
      .update(clients)
      .set({ deletedAt: null, updatedAt: new Date() })
      .where(eq(clients.id, id));
  }

  /**
   * Повне видалення.
   */
  async hardDelete(id: string): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  /**
   * Додати контактну особу до компанії.
   */
  async addCompanyContact(link: CompanyContact): Promise<void> {
    await db.insert(companyContacts).values({
      companyId: link.companyId,
      individualId: link.individualId,
      role: link.role,
    });
  }

  /**
   * Видалити зв'язок між компанією та фізичною особою.
   */
  async removeCompanyContact(
    companyId: string,
    individualId: string,
  ): Promise<void> {
    await db
      .delete(companyContacts)
      .where(
        and(
          eq(companyContacts.companyId, companyId),
          eq(companyContacts.individualId, individualId),
        ),
      );
  }

  /**
   * Оновити роль контактної особи в компанії.
   */
  async updateCompanyContactRole(
    companyId: string,
    individualId: string,
    role: CompanyContactRole,
  ): Promise<void> {
    await db
      .update(companyContacts)
      .set({ role })
      .where(
        and(
          eq(companyContacts.companyId, companyId),
          eq(companyContacts.individualId, individualId),
        ),
      );
  }

  /**
   * Отримати всіх контактних осіб компанії.
   */
  async findCompanyContacts(
    companyId: string,
  ): Promise<{ individual: Individual; role: CompanyContactRole }[]> {
    const result = await db
      .select({
        individual: individuals,
        role: companyContacts.role,
      })
      .from(companyContacts)
      .innerJoin(individuals, eq(companyContacts.individualId, individuals.id))
      .where(eq(companyContacts.companyId, companyId));

    return result.map((row) => ({
      individual: IndividualMapper.toDomain(row.individual),
      role: row.role as CompanyContactRole,
    }));
  }

  async isOwner(clientId: string, userId: string): Promise<boolean> {
    const [row] = await db
      .select({ val: sql`1` })
      .from(clients)
      .where(and(eq(clients.id, clientId), eq(clients.createdBy, userId)))
      .limit(1);

    return !!row;
  }
}
