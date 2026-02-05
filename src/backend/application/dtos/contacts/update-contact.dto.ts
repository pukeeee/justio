import { PassportDetailsProps } from "@/backend/domain/value-objects/passport-details.vo";

/**
 * DTO для оновлення існуючого контакту.
 */
export interface UpdateContactDTO {
  id: string; // Обов'язково для ідентифікації

  // Спільні поля (всі опціональні для часткового оновлення)
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  tags?: string[] | null;

  // Поля фізичної особи
  firstName?: string;
  lastName?: string;
  middleName?: string | null;
  dateOfBirth?: Date | null;
  taxNumber?: string | null;
  passportDetails?: PassportDetailsProps | null;

  // Поля компанії
  companyName?: string;
  taxId?: string | null;
}
