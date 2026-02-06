import { injectable, inject } from 'tsyringe';
import type { IContactRepository } from '@/backend/application/interfaces/repositories/contact.repository.interface';

/**
 * Use Case: М'яке видалення контакту (переміщення в кошик).
 */
@injectable()
export class DeleteContactUseCase {
  constructor(
    @inject('IContactRepository')
    private readonly contactRepository: IContactRepository
  ) {}

  async execute(contactId: string): Promise<void> {
    await this.contactRepository.softDelete(contactId);
  }
}
