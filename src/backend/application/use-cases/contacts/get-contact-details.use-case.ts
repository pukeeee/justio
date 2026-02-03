import { injectable, inject } from 'tsyringe';
import type { IContactRepository } from '@/backend/application/interfaces/repositories/contact.repository.interface';
import type { ContactDetailsDTO } from '@/backend/application/dtos/contacts/contact-details.dto';
import { EntityNotFoundError } from '@/backend/domain/errors/invalid-data.error';

/**
 * Use Case: Отримання повної інформації про контакт за його ID.
 */
@injectable()
export class GetContactDetailsUseCase {
  constructor(
    @inject('IContactRepository')
    private readonly contactRepository: IContactRepository
  ) {}

  /**
   * Завантажує базовий контакт та його специфічний профіль.
   */
  async execute(contactId: string): Promise<ContactDetailsDTO> {
    // 1. Отримуємо базовий контакт
    const contact = await this.contactRepository.findById(contactId);
    if (!contact) throw new EntityNotFoundError('Контакт', contactId);

    let individual = null;
    let company = null;

    // 2. Завантажуємо деталі залежно від типу
    if (contact.contactType === 'individual') {
      individual = await this.contactRepository.findIndividualByContactId(contactId);
    } else {
      company = await this.contactRepository.findCompanyByContactId(contactId);
    }

    return { contact, individual, company };
  }
}
