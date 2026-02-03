import { Individual, PassportDetails } from '@/backend/domain/entities/individual.entity';

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
    let passportDetails: PassportDetails | null = null;
    
    // Якщо дані паспорта є в JSON, конвертуємо рядок дати назад у Date
    if (rawPassport && typeof rawPassport.number === 'string') {
      passportDetails = {
        series: (rawPassport.series as string) ?? null,
        number: rawPassport.number,
        issuedBy: (rawPassport.issuedBy as string) ?? '',
        issuedDate: rawPassport.issuedDate ? new Date(rawPassport.issuedDate as string) : new Date(),
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
      passportDetails: passportDetails as PassportDetails | null,
    });
  }

  static toPersistence(individual: Individual) {
    return {
      id: individual.id,
      contactId: individual.contactId,
      firstName: individual.firstName,
      lastName: individual.lastName,
      middleName: individual.middleName,
      dateOfBirth: individual.dateOfBirth?.toISOString().split('T')[0] ?? null,
      taxNumber: individual.taxNumber,
      passportDetails: individual.passportDetails,
    };
  }
}
