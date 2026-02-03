import { ContactType } from '@/backend/domain/entities/contact.entity';
import { PassportDetails } from '@/backend/domain/entities/individual.entity';

/**
 * Універсальний DTO для створення або оновлення будь-якого контакту.
 */
export interface SaveContactDTO {
  id?: string; // Якщо є - це оновлення, якщо немає - створення
  workspaceId: string;
  contactType: ContactType;

  // Спільні поля
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  tags?: string[] | null;
  createdBy?: string | null;

  // Поля фізичної особи (тільки для contactType: 'individual')
  firstName?: string;
  lastName?: string;
  middleName?: string | null;
  dateOfBirth?: Date | null;
  taxNumber?: string | null;
  passportDetails?: PassportDetails | null;

  // Поля компанії (тільки для contactType: 'company')
  companyName?: string;
  taxId?: string | null;
}
