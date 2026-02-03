import { injectable, inject } from 'tsyringe';
import type { IContactRepository } from '@/backend/application/interfaces/repositories/contact.repository.interface';

/**
 * Use Case: Відновлення контакту з кошика.
 */
@injectable()
export class RestoreContactUseCase {
  constructor(
    @inject('IContactRepository')
    private readonly contactRepository: IContactRepository
  ) {}

  async execute(contactId: string): Promise<void> {
    await this.contactRepository.restore(contactId);
  }
}
