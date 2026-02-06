import { Contact } from '@/backend/domain/entities/contact.entity';
import { ContactType } from '@/backend/domain/value-objects/contact-type.enum';

/**
 * Тип, що відповідає структурі таблиці 'contacts' у Drizzle.
 */
type DbContact = {
  id: string;
  workspaceId: string;
  contactType: 'individual' | 'company';
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  tags: string[] | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

/**
 * Мапер для перетворення даних між базою даних та доменом для сутності Contact.
 */
export class ContactMapper {
  /**
   * Перетворює дані з БД у сутність домену.
   */
  static toDomain(raw: DbContact): Contact {
    return Contact.create({
      id: raw.id,
      workspaceId: raw.workspaceId,
      contactType: raw.contactType as ContactType,
      email: raw.email,
      phone: raw.phone,
      address: raw.address,
      notes: raw.notes,
      tags: raw.tags,
      createdBy: raw.createdBy,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  /**
   * Перетворює сутність домену у формат для збереження в БД.
   */
  static toPersistence(contact: Contact) {
    return {
      id: contact.id,
      workspaceId: contact.workspaceId,
      contactType: contact.contactType,
      email: contact.email,
      phone: contact.phone,
      address: contact.address,
      notes: contact.notes,
      tags: contact.tags,
      createdBy: contact.createdBy,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
      deletedAt: contact.deletedAt,
    };
  }
}
