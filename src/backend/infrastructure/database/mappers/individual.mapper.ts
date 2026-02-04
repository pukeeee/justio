import { Individual } from "@/backend/domain/entities/individual.entity";
import { PassportDetailsProps } from "@/backend/domain/value-objects/passport-details.vo";

/**
 * Тип для рядка з таблиці individuals.
 */
type DbIndividual = {
  id: string;
  contactId: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  dateOfBirth: string | null; // Drizzle повертає дату як рядок
  taxNumber: string | null;
  passportDetails: unknown; // jsonb
};

export class IndividualMapper {
  static toDomain(raw: DbIndividual): Individual {
    const rawPassport = raw.passportDetails as Record<string, unknown> | null;
    let passportProps: PassportDetailsProps | null = null;

    // Якщо дані паспорта є в JSON, готуємо пропсу для доменної сутності
    if (rawPassport && typeof rawPassport.number === "string") {
      passportProps = {
        series: (rawPassport.series as string) ?? null,
        number: rawPassport.number,
        issuedBy: (rawPassport.issuedBy as string) ?? "",
        issuedDate: rawPassport.issuedDate
          ? new Date(rawPassport.issuedDate as string)
          : new Date(),
      };
    }

    return Individual.create({
      id: raw.id,
      contactId: raw.contactId,
      firstName: raw.firstName,
      lastName: raw.lastName,
      middleName: raw.middleName,
      dateOfBirth: raw.dateOfBirth ? new Date(raw.dateOfBirth) : null,
      taxNumber: raw.taxNumber,
      passportDetails: passportProps,
    });
  }

  static toPersistence(individual: Individual) {
    const passport = individual.passportDetails;

    return {
      id: individual.id,
      contactId: individual.contactId,
      firstName: individual.firstName,
      lastName: individual.lastName,
      middleName: individual.middleName,
      dateOfBirth: individual.dateOfBirth?.toISOString().split("T")[0] ?? null,
      taxNumber: individual.taxNumber,
      // Конвертуємо Value Object назад у простий об'єкт для JSONB
      passportDetails: passport
        ? {
            series: passport.series,
            number: passport.number,
            issuedBy: passport.issuedBy,
            issuedDate: passport.issuedDate.toISOString(),
          }
        : null,
    };
  }
}
