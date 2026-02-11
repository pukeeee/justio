import { ClientType } from "@/backend/domain/value-objects/client-type.enum";
import { PassportDetailsProps } from "@/backend/domain/value-objects/passport-details.vo";

/**
 * DTO для створення нового клієнта.
 */
export interface CreateClientDTO {
  workspaceId: string;
  clientType: ClientType;

  // Спільні поля
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  note?: string | null;
  createdBy?: string | null;

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
