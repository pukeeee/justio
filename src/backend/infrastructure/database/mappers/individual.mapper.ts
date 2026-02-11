import { Individual } from "@/backend/domain/entities/individual.entity";
import { PassportDetailsProps } from "@/backend/domain/value-objects/passport-details.vo";
import { individuals } from "../drizzle/schema";

/**
 * Тип для рядка з таблиці individuals.
 */
export type DbIndividual = typeof individuals.$inferSelect;

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
      clientId: raw.clientId,
      firstName: raw.firstName,
      lastName: raw.lastName,
      middleName: raw.middleName,
      dateOfBirth: raw.dateOfBirth ? new Date(raw.dateOfBirth) : null,
      taxNumber: raw.taxNumber,
      isFop: raw.isFop,
      passportDetails: passportProps,
    });
  }

  static toPersistence(individual: Individual) {
    const passport = individual.passportDetails;

    return {
      id: individual.id,
      clientId: individual.clientId,
      firstName: individual.firstName,
      lastName: individual.lastName,
      middleName: individual.middleName,
      dateOfBirth: individual.dateOfBirth?.toISOString().split("T")[0] ?? null,
      taxNumber: individual.taxNumber,
      isFop: individual.isFop,
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
