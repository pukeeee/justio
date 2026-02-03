import { Company } from '@/backend/domain/entities/company.entity';

type DbCompany = {
  id: string;
  contactId: string;
  name: string;
  taxId: string | null;
};

export class CompanyMapper {
  static toDomain(raw: DbCompany): Company {
    return Company.create({
      id: raw.id,
      contactId: raw.contactId,
      name: raw.name,
      taxId: raw.taxId,
    });
  }

  static toPersistence(company: Company) {
    return {
      id: company.id,
      contactId: company.contactId,
      name: company.name,
      taxId: company.taxId,
    };
  }
}
