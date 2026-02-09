import { Client } from "@/backend/domain/entities/client.entity";
import { Individual } from "@/backend/domain/entities/individual.entity";
import { Company } from "@/backend/domain/entities/company.entity";

/**
 * Повний об'єкт контакту для сторінки деталей/редагування.
 */
export interface ClientDetailsDTO {
  client: Client;
  individual: Individual | null;
  company: Company | null;
}
