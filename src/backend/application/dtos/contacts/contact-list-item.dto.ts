import { ContactType } from "@/backend/domain/value-objects/contact-type.enum";

/**
 * Об'єкт для відображення в загальному списку контактів.
 * Містить агреговані дані (Ім'я або Назва компанії).
 */
export interface ContactListItemDTO {
  id: string;
  contactType: ContactType;
  displayName: string; // "Прізвище Ім'я" або "Назва компанії"
  email: string | null;
  phone: string | null;
  tags: string[] | null;
  createdAt: Date;
}
