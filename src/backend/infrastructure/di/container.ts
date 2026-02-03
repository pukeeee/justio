import 'reflect-metadata';
import { container } from 'tsyringe';

// --- Реєстрація Репозиторіїв ---
import { IContactRepository } from '@/backend/application/interfaces/repositories/contact.repository.interface';
import { DrizzleContactRepository } from '@/backend/infrastructure/database/repositories/drizzle-contact.repository';

// Реєструємо імплементацію для інтерфейсу
container.register<IContactRepository>(
  'IContactRepository',
  { useClass: DrizzleContactRepository }
);

// --- Реєстрація Use Cases ---
import { SaveContactUseCase } from '@/backend/application/use-cases/contacts/save-contact.use-case';
import { GetContactsListUseCase } from '@/backend/application/use-cases/contacts/get-contacts-list.use-case';
import { GetContactDetailsUseCase } from '@/backend/application/use-cases/contacts/get-contact-details.use-case';
import { DeleteContactUseCase } from '@/backend/application/use-cases/contacts/delete-contact.use-case';
import { RestoreContactUseCase } from '@/backend/application/use-cases/contacts/restore-contact.use-case';

container.register(SaveContactUseCase, {
  useClass: SaveContactUseCase
});

container.register(GetContactsListUseCase, {
  useClass: GetContactsListUseCase
});

container.register(GetContactDetailsUseCase, {
  useClass: GetContactDetailsUseCase
});

container.register(DeleteContactUseCase, {
  useClass: DeleteContactUseCase
});

container.register(RestoreContactUseCase, {
  useClass: RestoreContactUseCase
});


export { container };
