import "reflect-metadata";
import { container } from "tsyringe";

// --- Реєстрація Репозиторіїв ---
import { IClientRepository } from "@/backend/application/interfaces/repositories/client.repository.interface";
import { DrizzleClientRepository } from "@/backend/infrastructure/database/repositories/drizzle-client.repository";
import { IWorkspaceRepository } from "@/backend/application/interfaces/repositories/workspace.repository.interface";
import { DrizzleWorkspaceRepository } from "@/backend/infrastructure/database/repositories/drizzle-workspace.repository";

// Реєструємо імплементацію для інтерфейсу
container.register<IClientRepository>("IClientRepository", {
  useClass: DrizzleClientRepository,
});

container.register<IWorkspaceRepository>("IWorkspaceRepository", {
  useClass: DrizzleWorkspaceRepository,
});

// --- Реєстрація Auth ---
import { IAuthService } from "@/backend/application/interfaces/services/auth.service.interface";
import { SupabaseAuthAdapter } from "@/backend/infrastructure/auth/supabase-auth.adapter";
import { IAuthRepository } from "@/backend/application/interfaces/repositories/auth.repository.interface";
import { DrizzleAuthRepository } from "@/backend/infrastructure/database/repositories/drizzle-auth.repository";
import { IAuthorizationService } from "@/backend/application/interfaces/services/authorization.service.interface";
import { AuthorizationService } from "@/backend/application/services/authorization.service";

container.register<IAuthService>("IAuthService", {
  useClass: SupabaseAuthAdapter,
});
container.register<IAuthRepository>("IAuthRepository", {
  useClass: DrizzleAuthRepository,
});
container.register<IAuthorizationService>("IAuthorizationService", {
  useClass: AuthorizationService,
});

// --- Реєстрація Use Cases ---
import { CreateClientUseCase } from "@/backend/application/use-cases/clients/create-client.use-case";
import { UpdateClientUseCase } from "@/backend/application/use-cases/clients/update-client.use-case";
import { GetClientsListUseCase } from "@/backend/application/use-cases/clients/get-clients-list.use-case";
import { GetClientDetailsUseCase } from "@/backend/application/use-cases/clients/get-client-details.use-case";
import { DeleteClientUseCase } from "@/backend/application/use-cases/clients/delete-client.use-case";
import { RestoreClientUseCase } from "@/backend/application/use-cases/clients/restore-client.use-case";
import { HardDeleteClientUseCase } from "@/backend/application/use-cases/clients/hard-delete-client.use-case";
import { CreateWorkspaceUseCase } from "@/backend/application/use-cases/workspace/create-workspace.use-case";
import { DeleteWorkspaceUseCase } from "@/backend/application/use-cases/workspace/delete-workspace.use-case";

container.register(CreateClientUseCase, {
  useClass: CreateClientUseCase,
});

container.register(UpdateClientUseCase, {
  useClass: UpdateClientUseCase,
});

container.register(GetClientsListUseCase, {
  useClass: GetClientsListUseCase,
});

container.register(GetClientDetailsUseCase, {
  useClass: GetClientDetailsUseCase,
});

container.register(DeleteClientUseCase, {
  useClass: DeleteClientUseCase,
});

container.register(RestoreClientUseCase, {
  useClass: RestoreClientUseCase,
});

container.register(HardDeleteClientUseCase, {
  useClass: HardDeleteClientUseCase,
});

container.register(CreateWorkspaceUseCase, {
  useClass: CreateWorkspaceUseCase,
});

container.register(DeleteWorkspaceUseCase, {
  useClass: DeleteWorkspaceUseCase,
});

export { container };
