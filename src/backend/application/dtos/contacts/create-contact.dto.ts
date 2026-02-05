import { ContactType } from "@/backend/domain/value-objects/contact-type.enum";
import { PassportDetailsProps } from "@/backend/domain/value-objects/passport-details.vo";

/**
 * DTO для створення нового контакту.
 */
export interface CreateContactDTO {
  workspaceId: string;
  contactType: ContactType;

  // Спільні поля
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  tags?: string[] | null;
  createdBy?: string | null;

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
