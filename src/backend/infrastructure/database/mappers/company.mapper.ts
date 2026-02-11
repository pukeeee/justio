import { Company } from "@/backend/domain/entities/company.entity";
import { companies } from "../drizzle/schema";

/**
 * Тип для рядка з таблиці companies.
 */
export type DbCompany = typeof companies.$inferSelect;

export class CompanyMapper {
  static toDomain(raw: DbCompany): Company {
    return Company.create({
      id: raw.id,
      clientId: raw.clientId,
      name: raw.name,
      taxId: raw.taxId,
    });
  }

  static toPersistence(company: Company) {
    return {
      id: company.id,
      clientId: company.clientId,
      name: company.name,
      taxId: company.taxId,
    };
  }
}
