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
} from "drizzle-orm";
import { db } from "../drizzle/client";
import { contacts, individuals, companies, companyContacts } from "../drizzle/schema";
import { Contact } from "@/backend/domain/entities/contact.entity";
import { Individual } from "@/backend/domain/entities/individual.entity";
import { Company } from "@/backend/domain/entities/company.entity";
import { CompanyContact, CompanyContactRole } from "@/backend/domain/entities/company-contact.entity";
import {
  IContactRepository,
  FindAllContactsOptions,
} from "@/backend/application/interfaces/repositories/contact.repository.interface";
import { ContactMapper } from "../mappers/contact.mapper";
import { IndividualMapper } from "../mappers/individual.mapper";
import { CompanyMapper } from "../mappers/company.mapper";
import { ContactListItemDTO } from "@/backend/application/dtos/contacts/contact-list-item.dto";

@injectable()
export class DrizzleContactRepository implements IContactRepository {
  /**
   * Знайти базовий контакт за ID.
   */
  async findById(id: string): Promise<Contact | null> {
    const [row] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, id))
      .limit(1);

    if (!row) return null;

    return ContactMapper.toDomain(row);
  }

  /**
   * Знайти фізичну особу за її контактним ID.
   */
  async findIndividualByContactId(
    contactId: string,
  ): Promise<Individual | null> {
    const [row] = await db
      .select()
      .from(individuals)
      .where(eq(individuals.contactId, contactId))
      .limit(1);

    if (!row) return null;

    // Drizzle повертає дату як рядок для типу 'date', мапер це обробить
    return IndividualMapper.toDomain(row);
  }

  /**
   * Знайти компанію за її контактним ID.
   */
  async findCompanyByContactId(contactId: string): Promise<Company | null> {
    const [row] = await db
      .select()
      .from(companies)
      .where(eq(companies.contactId, contactId))
      .limit(1);

    if (!row) return null;

    return CompanyMapper.toDomain(row);
  }

  /**
   * Атомарне збереження через транзакцію.
   */
  async saveFullContact(
    contact: Contact,
    details: Individual | Company,
  ): Promise<void> {
    const contactData = ContactMapper.toPersistence(contact);

    await db.transaction(async (tx) => {
      // 1. Зберігаємо базовий контакт
      await tx.insert(contacts).values(contactData).onConflictDoUpdate({
        target: contacts.id,
        set: contactData,
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
    options: FindAllContactsOptions,
  ): Promise<ContactListItemDTO[]> {
    const { limit = 20, offset = 0, search, onlyDeleted = false } = options;

    const query = db
      .select({
        id: contacts.id,
        contactType: contacts.contactType,
        email: contacts.email,
        phone: contacts.phone,
        tags: contacts.tags,
        createdAt: contacts.createdAt,
        firstName: individuals.firstName,
        lastName: individuals.lastName,
        companyName: companies.name,
      })
      .from(contacts)
      .leftJoin(individuals, eq(contacts.id, individuals.contactId))
      .leftJoin(companies, eq(contacts.id, companies.contactId))
      .where(
        and(
          eq(contacts.workspaceId, workspaceId),
          onlyDeleted
            ? isNotNull(contacts.deletedAt)
            : isNull(contacts.deletedAt),
          search
            ? or(
                ilike(individuals.firstName, `%${search}%`),
                ilike(individuals.lastName, `%${search}%`),
                ilike(companies.name, `%${search}%`),
                ilike(contacts.email, `%${search}%`),
                ilike(contacts.phone, `%${search}%`),
                ilike(individuals.taxNumber, `%${search}%`),
                ilike(companies.taxId, `%${search}%`),
              )
            : undefined,
        ),
      )
      .orderBy(desc(contacts.createdAt))
      .limit(limit)
      .offset(offset);

    const result = await query;

    return result.map((row) => ({
      id: row.id,
      contactType: row.contactType as "individual" | "company",
      displayName:
        row.contactType === "individual"
          ? `${row.lastName} ${row.firstName}`.trim()
          : row.companyName || "Без назви",
      email: row.email,
      phone: row.phone,
      tags: row.tags,
      createdAt: row.createdAt,
    }));
  }

  /**
   * Підрахунок для пагінації.
   */
  async countAllByWorkspaceId(
    workspaceId: string,
    options: FindAllContactsOptions,
  ): Promise<number> {
    const { search, onlyDeleted = false } = options;

    const [result] = await db
      .select({ value: count() })
      .from(contacts)
      .leftJoin(individuals, eq(contacts.id, individuals.contactId))
      .leftJoin(companies, eq(contacts.id, companies.contactId))
      .where(
        and(
          eq(contacts.workspaceId, workspaceId),
          onlyDeleted
            ? isNotNull(contacts.deletedAt)
            : isNull(contacts.deletedAt),
          search
            ? or(
                ilike(individuals.firstName, `%${search}%`),
                ilike(individuals.lastName, `%${search}%`),
                ilike(companies.name, `%${search}%`),
                ilike(contacts.email, `%${search}%`),
                ilike(contacts.phone, `%${search}%`),
                ilike(individuals.taxNumber, `%${search}%`),
                ilike(companies.taxId, `%${search}%`),
              )
            : undefined,
        ),
      );

    return result?.value ?? 0;
  }

  /**
   * Перевірка унікальності ІПН (РНОКПП).
   */
  async existsByTaxNumber(
    workspaceId: string,
    taxNumber: string,
    excludeContactId?: string,
  ): Promise<boolean> {
    const [row] = await db
      .select({ id: individuals.id })
      .from(individuals)
      .innerJoin(contacts, eq(individuals.contactId, contacts.id))
      .where(
        and(
          eq(contacts.workspaceId, workspaceId),
          eq(individuals.taxNumber, taxNumber),
          isNull(contacts.deletedAt),
          excludeContactId
            ? ne(individuals.contactId, excludeContactId)
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
    excludeContactId?: string,
  ): Promise<boolean> {
    const [row] = await db
      .select({ id: companies.id })
      .from(companies)
      .innerJoin(contacts, eq(companies.contactId, contacts.id))
      .where(
        and(
          eq(contacts.workspaceId, workspaceId),
          eq(companies.taxId, taxId),
          isNull(contacts.deletedAt),
          excludeContactId
            ? ne(companies.contactId, excludeContactId)
            : undefined,
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
    excludeContactId?: string,
  ): Promise<boolean> {
    const [row] = await db
      .select({ id: contacts.id })
      .from(contacts)
      .where(
        and(
          eq(contacts.workspaceId, workspaceId),
          eq(contacts.email, email.trim().toLowerCase()),
          isNull(contacts.deletedAt),
          excludeContactId ? ne(contacts.id, excludeContactId) : undefined,
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
    excludeContactId?: string,
  ): Promise<boolean> {
    // Нормалізуємо для пошуку (використовуємо наш VO через статик або просто базову очистку)
    const normalizedPhone = phone.replace(/\D/g, ''); 
    // Оскільки ми зберігаємо в базі з плюсом через Phone.create, 
    // пошук має бути гнучким. Для надійності краще нормалізувати перед запитом.

    const [row] = await db
      .select({ id: contacts.id })
      .from(contacts)
      .where(
        and(
          eq(contacts.workspaceId, workspaceId),
          // Шукаємо за частковим збігом цифр, щоб уникнути проблем з форматами
          ilike(contacts.phone, `%${normalizedPhone}%`),
          isNull(contacts.deletedAt),
          excludeContactId ? ne(contacts.id, excludeContactId) : undefined,
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
      .update(contacts)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(contacts.id, id));
  }

  /**
   * Відновлення.
   */
  async restore(id: string): Promise<void> {
    await db
      .update(contacts)
      .set({ deletedAt: null, updatedAt: new Date() })
      .where(eq(contacts.id, id));
  }

  /**
   * Повне видалення.
   */
  async hardDelete(id: string): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
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
  async removeCompanyContact(companyId: string, individualId: string): Promise<void> {
    await db.delete(companyContacts).where(
      and(
        eq(companyContacts.companyId, companyId),
        eq(companyContacts.individualId, individualId)
      )
    );
  }

  /**
   * Оновити роль контактної особи в компанії.
   */
  async updateCompanyContactRole(companyId: string, individualId: string, role: CompanyContactRole): Promise<void> {
    await db
      .update(companyContacts)
      .set({ role })
      .where(
        and(
          eq(companyContacts.companyId, companyId),
          eq(companyContacts.individualId, individualId)
        )
      );
  }

  /**
   * Отримати всіх контактних осіб компанії.
   */
  async findCompanyContacts(companyId: string): Promise<{ individual: Individual; role: CompanyContactRole }[]> {
    const result = await db
      .select({
        individual: individuals,
        role: companyContacts.role,
      })
      .from(companyContacts)
      .innerJoin(individuals, eq(companyContacts.individualId, individuals.id))
      .where(eq(companyContacts.companyId, companyId));

    return result.map(row => ({
      individual: IndividualMapper.toDomain(row.individual),
      role: row.role as CompanyContactRole,
    }));
  }
}
