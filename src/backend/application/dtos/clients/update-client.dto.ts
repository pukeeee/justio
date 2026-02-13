import { PassportDetailsProps } from "@/backend/domain/value-objects/passport-details.vo";

/**
 * DTO для оновлення існуючого клієнта.
 */
export interface UpdateClientDTO {
  id: string; // Обов'язково для ідентифікації
  workspaceId: string; // Обов'язково для безпеки

  // Спільні поля (всі опціональні для часткового оновлення)
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  note?: string | null;

  // Поля фізичної особи
  firstName?: string;
  lastName?: string;
  middleName?: string | null;
  dateOfBirth?: Date | null;
  taxNumber?: string | null;
  isFop?: boolean;
  passportDetails?: PassportDetailsProps | null;

  // Поля компанії
  companyName?: string;
  taxId?: string | null;
}