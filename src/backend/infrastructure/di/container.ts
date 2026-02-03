import 'reflect-metadata';
import { container } from 'tsyringe';

// --- Реєстрація Репозиторіїв ---
import { IContactRepository } from '@/backend/application/interfaces/repositories/contact.repository.interface';
import { DrizzleContactRepository } from '@/backend/infrastructure/database/repositories/drizzle-contact.repository';
import { IWorkspaceRepository } from '@/backend/application/interfaces/repositories/workspace.repository.interface';
import { DrizzleWorkspaceRepository } from '@/backend/infrastructure/database/repositories/drizzle-workspace.repository';

// Реєструємо імплементацію для інтерфейсу
container.register<IContactRepository>(
  'IContactRepository',
  { useClass: DrizzleContactRepository }
);

container.register<IWorkspaceRepository>(
  'IWorkspaceRepository',
  { useClass: DrizzleWorkspaceRepository }
);

// --- Реєстрація Auth ---
import { IAuthService } from '@/backend/application/interfaces/services/auth.service.interface';
import { SupabaseAuthAdapter } from '@/backend/infrastructure/auth/supabase-auth.adapter';
import { IAuthRepository } from '@/backend/application/interfaces/repositories/auth.repository.interface';
import { DrizzleAuthRepository } from '@/backend/infrastructure/database/repositories/drizzle-auth.repository';
import { IAuthorizationService } from '@/backend/application/interfaces/services/authorization.service.interface';
import { AuthorizationService } from '@/backend/application/services/authorization.service';

container.register<IAuthService>('IAuthService', { useClass: SupabaseAuthAdapter });
container.register<IAuthRepository>('IAuthRepository', { useClass: DrizzleAuthRepository });
container.register<IAuthorizationService>('IAuthorizationService', { useClass: AuthorizationService });

// --- Реєстрація Use Cases ---
import { SaveContactUseCase } from '@/backend/application/use-cases/contacts/save-contact.use-case';
import { GetContactsListUseCase } from '@/backend/application/use-cases/contacts/get-contacts-list.use-case';
import { GetContactDetailsUseCase } from '@/backend/application/use-cases/contacts/get-contact-details.use-case';
import { DeleteContactUseCase } from '@/backend/application/use-cases/contacts/delete-contact.use-case';
import { RestoreContactUseCase } from '@/backend/application/use-cases/contacts/restore-contact.use-case';
import { CreateWorkspaceUseCase } from '@/backend/application/use-cases/workspace/create-workspace.use-case';
import { DeleteWorkspaceUseCase } from '@/backend/application/use-cases/workspace/delete-workspace.use-case';

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

container.register(CreateWorkspaceUseCase, {
  useClass: CreateWorkspaceUseCase
});

container.register(DeleteWorkspaceUseCase, {
  useClass: DeleteWorkspaceUseCase
});


export { container };
