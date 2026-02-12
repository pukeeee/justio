import { BaseController } from "./base.controller";
import { CreateClientUseCase } from "@/backend/application/use-cases/clients/create-client.use-case";
import { UpdateClientUseCase } from "@/backend/application/use-cases/clients/update-client.use-case";
import { GetClientsListUseCase } from "@/backend/application/use-cases/clients/get-clients-list.use-case";
import { GetClientDetailsUseCase } from "@/backend/application/use-cases/clients/get-client-details.use-case";
import { DeleteClientUseCase } from "@/backend/application/use-cases/clients/delete-client.use-case";
import { RestoreClientUseCase } from "@/backend/application/use-cases/clients/restore-client.use-case";
import { HardDeleteClientUseCase } from "@/backend/application/use-cases/clients/hard-delete-client.use-case";
import { container } from "@/backend/infrastructure/di/container";
import { Permission } from "@/backend/domain/value-objects/permission.enum";
import type {
  CreateClientRequest,
  CreateClientResponse,
  UpdateClientRequest,
  UpdateClientResponse,
  GetClientsRequest,
  GetClientsResponse,
  GetClientDetailsRequest,
  ClientDetailsResponse,
  DeleteClientRequest,
  RestoreClientRequest,
  HardDeleteClientRequest,
} from "../contracts/client.contracts";
import {
  CreateClientRequestSchema,
  UpdateClientRequestSchema,
  GetClientsRequestSchema,
  GetClientDetailsRequestSchema,
  DeleteClientRequestSchema,
  RestoreClientRequestSchema,
  HardDeleteClientRequestSchema,
} from "../contracts/client.contracts";
import type { ApiResponse } from "../contracts/base.contracts";
import { ClientMapper } from "../mappers/client.mapper";
import { RequirePermissions } from "../middleware/permission.guard";

/**
 * Контролер для роботи з клієнтами
 *
 * Відповідальність:
 * 1. Перевірка авторизації
 * 2. Перевірка прав доступу
 * 3. Маппінг request → use case DTO
 * 4. Виклик use case
 * 5. Маппінг domain → response
 * 6. Обробка помилок
 */
export class ClientController extends BaseController {
  private createClientUseCase: CreateClientUseCase;
  private updateClientUseCase: UpdateClientUseCase;
  private getClientsListUseCase: GetClientsListUseCase;
  private getClientDetailsUseCase: GetClientDetailsUseCase;
  private deleteClientUseCase: DeleteClientUseCase;
  private restoreClientUseCase: RestoreClientUseCase;
  private hardDeleteClientUseCase: HardDeleteClientUseCase;
  private mapper: ClientMapper;

  constructor() {
    super();
    // Резолвимо use cases з DI container
    this.createClientUseCase = container.resolve(CreateClientUseCase);
    this.updateClientUseCase = container.resolve(UpdateClientUseCase);
    this.getClientsListUseCase = container.resolve(GetClientsListUseCase);
    this.getClientDetailsUseCase = container.resolve(GetClientDetailsUseCase);
    this.deleteClientUseCase = container.resolve(DeleteClientUseCase);
    this.restoreClientUseCase = container.resolve(RestoreClientUseCase);
    this.hardDeleteClientUseCase = container.resolve(HardDeleteClientUseCase);
    this.mapper = new ClientMapper();
  }

  /**
   * Створення нового клієнта
   */
  @RequirePermissions([Permission.CREATE_CONTACT])
  async create(
    request: CreateClientRequest,
  ): Promise<ApiResponse<CreateClientResponse>> {
    return this.execute(async () => {
      // 1. Рантайм-валідація вхідних даних
      const validatedRequest = CreateClientRequestSchema.parse(request);

      // 2. Перевірка автентифікації
      const user = await this.getCurrentUserOrThrow();

      // 3. Перевірка прав доступу
      await this.checkMethodPermissions(
        this.create,
        user.id,
        validatedRequest.workspaceId,
      );

      // 4. Маппінг API request → Use Case DTO
      const useCaseDto = this.mapper.toCreateDto(validatedRequest, user.id);

      // 5. Виклик use case
      const { client, details } =
        await this.createClientUseCase.execute(useCaseDto);

      // 6. Маппінг domain → API response
      return this.mapper.toCreateResponse(client, details);
    });
  }

  /**
   * Оновлення існуючого клієнта
   */
  @RequirePermissions([Permission.UPDATE_CONTACT])
  async update(
    request: UpdateClientRequest,
  ): Promise<ApiResponse<UpdateClientResponse>> {
    return this.execute(async () => {
      // 1. Рантайм-валідація
      const validatedRequest = UpdateClientRequestSchema.parse(request);

      const user = await this.getCurrentUserOrThrow();

      await this.checkMethodPermissions(
        this.update,
        user.id,
        validatedRequest.workspaceId,
      );

      const useCaseDto = this.mapper.toUpdateDto(validatedRequest);
      const { client, details } =
        await this.updateClientUseCase.execute(useCaseDto);

      return this.mapper.toUpdateResponse(client, details);
    });
  }

  /**
   * Отримання списку клієнтів з пагінацією та пошуком
   */
  @RequirePermissions([Permission.VIEW_CONTACT])
  async getList(
    request: GetClientsRequest,
  ): Promise<ApiResponse<GetClientsResponse>> {
    return this.execute(async () => {
      // 1. Рантайм-валідація
      const validatedRequest = GetClientsRequestSchema.parse(request);

      const user = await this.getCurrentUserOrThrow();

      await this.checkMethodPermissions(
        this.getList,
        user.id,
        validatedRequest.workspaceId,
      );

      // Виклик use case
      const result = await this.getClientsListUseCase.execute(
        validatedRequest.workspaceId,
        {
          limit: validatedRequest.limit,
          offset: validatedRequest.offset,
          search: validatedRequest.search,
          onlyDeleted: validatedRequest.onlyDeleted,
        },
      );

      // Маппінг у API response
      return this.mapper.toListResponse(result);
    });
  }

  /**
   * Отримання повної інформації про клієнта
   */
  @RequirePermissions([Permission.VIEW_CONTACT])
  async getDetails(
    request: GetClientDetailsRequest,
  ): Promise<ApiResponse<ClientDetailsResponse>> {
    return this.execute(async () => {
      // 1. Рантайм-валідація
      const validatedRequest = GetClientDetailsRequestSchema.parse(request);

      const user = await this.getCurrentUserOrThrow();

      await this.checkMethodPermissions(
        this.getDetails,
        user.id,
        validatedRequest.workspaceId,
      );

      const result = await this.getClientDetailsUseCase.execute(validatedRequest.id);
      return this.mapper.toDetailsResponse(result);
    });
  }

  /**
   * М'яке видалення клієнта (переміщення в кошик)
   */
  @RequirePermissions([Permission.DELETE_CONTACT])
  async delete(request: DeleteClientRequest): Promise<ApiResponse<void>> {
    return this.execute(async () => {
      // 1. Рантайм-валідація
      const validatedRequest = DeleteClientRequestSchema.parse(request);

      const user = await this.getCurrentUserOrThrow();

      await this.checkMethodPermissions(
        this.delete,
        user.id,
        validatedRequest.workspaceId,
      );

      await this.deleteClientUseCase.execute(validatedRequest.id, validatedRequest.workspaceId);
    });
  }

  /**
   * Відновлення клієнта з кошика
   */
  @RequirePermissions([Permission.DELETE_CONTACT])
  async restore(request: RestoreClientRequest): Promise<ApiResponse<void>> {
    return this.execute(async () => {
      // 1. Рантайм-валідація
      const validatedRequest = RestoreClientRequestSchema.parse(request);

      const user = await this.getCurrentUserOrThrow();

      await this.checkMethodPermissions(
        this.restore,
        user.id,
        validatedRequest.workspaceId,
      );

      await this.restoreClientUseCase.execute(validatedRequest.id, validatedRequest.workspaceId);
    });
  }

  /**
   * Остаточне видалення клієнта з бази даних
   */
  @RequirePermissions([Permission.DELETE_CONTACT])
  async hardDelete(
    request: HardDeleteClientRequest,
  ): Promise<ApiResponse<void>> {
    return this.execute(async () => {
      // 1. Рантайм-валідація
      const validatedRequest = HardDeleteClientRequestSchema.parse(request);

      const user = await this.getCurrentUserOrThrow();

      await this.checkMethodPermissions(
        this.hardDelete,
        user.id,
        validatedRequest.workspaceId,
      );

      await this.hardDeleteClientUseCase.execute(validatedRequest.id, validatedRequest.workspaceId);
    });
  }
}

/**
 * Singleton instance контролера
 */
export const clientController = new ClientController();
