import { Contact } from '@/backend/domain/entities/contact.entity';
import { Individual } from '@/backend/domain/entities/individual.entity';
import { Company } from '@/backend/domain/entities/company.entity';

/**
 * Повний об'єкт контакту для сторінки деталей/редагування.
 */
export interface ContactDetailsDTO {
  contact: Contact;
  individual: Individual | null;
  company: Company | null;
}
