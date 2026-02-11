import { ClientType } from "@/backend/domain/value-objects/client-type.enum";

/**
 * Об'єкт для відображення в загальному списку клієнтів.
 * Містить агреговані дані (Ім'я або Назва компанії).
 */
export interface ClientListItemDTO {
  id: string;
  clientType: ClientType;
  displayName: string; // Залишаємо для зворотної сумісності, якщо десь використовується
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  email: string | null;
  phone: string | null;
  taxNumber?: string | null;
  taxId?: string | null;
  isFop?: boolean;
  createdAt: Date;
}
