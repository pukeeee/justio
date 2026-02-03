/**
 * Об'єкт для відображення в загальному списку контактів.
 * Містить агреговані дані (Ім'я або Назва компанії).
 */
export interface ContactListItemDTO {
  id: string;
  contactType: 'individual' | 'company';
  displayName: string; // "Прізвище Ім'я" або "Назва компанії"
  email: string | null;
  phone: string | null;
  tags: string[] | null;
  createdAt: Date;
}
