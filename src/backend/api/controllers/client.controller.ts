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
 * Використовує BaseController.action для автоматизації:
 * - Валідації (Zod)
 * - Автентифікації
 * - Перевірки прав (на основі workspaceId у запиті)
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
    return this.action(this.create, request, CreateClientRequestSchema, async (data, user) => {
      const useCaseDto = this.mapper.toCreateDto(data, user.id);
      const { client } = await this.createClientUseCase.execute(useCaseDto);
      return this.mapper.toCreateResponse(client);
    });
  }

  /**
   * Оновлення існуючого клієнта
   */
  @RequirePermissions([Permission.UPDATE_CONTACT])
  async update(
    request: UpdateClientRequest,
  ): Promise<ApiResponse<UpdateClientResponse>> {
    return this.action(this.update, request, UpdateClientRequestSchema, async (data) => {
      const useCaseDto = this.mapper.toUpdateDto(data);
      const { client } = await this.updateClientUseCase.execute(useCaseDto);
      return this.mapper.toUpdateResponse(client);
    });
  }

  /**
   * Отримання списку клієнтів
   */
  @RequirePermissions([Permission.VIEW_CONTACT])
  async getList(
    request: GetClientsRequest,
  ): Promise<ApiResponse<GetClientsResponse>> {
    return this.action(this.getList, request, GetClientsRequestSchema, async (data) => {
      const result = await this.getClientsListUseCase.execute(data.workspaceId, {
        limit: data.limit,
        offset: data.offset,
        search: data.search,
        onlyDeleted: data.onlyDeleted,
      });
      return this.mapper.toListResponse(result, data.limit, data.offset);
    });
  }

  /**
   * Отримання повної інформації про клієнта
   */
  @RequirePermissions([Permission.VIEW_CONTACT])
  async getDetails(
    request: GetClientDetailsRequest,
  ): Promise<ApiResponse<ClientDetailsResponse>> {
    return this.action(
      this.getDetails,
      request,
      GetClientDetailsRequestSchema,
      async (data) => {
        const result = await this.getClientDetailsUseCase.execute(
          data.id,
          data.workspaceId,
        );
        return this.mapper.toDetailsResponse(result);
      },
    );
  }

  /**
   * М'яке видалення клієнта
   */
  @RequirePermissions([Permission.DELETE_CONTACT])
  async delete(request: DeleteClientRequest): Promise<ApiResponse<void>> {
    return this.action(this.delete, request, DeleteClientRequestSchema, async (data) => {
      await this.deleteClientUseCase.execute(data.id, data.workspaceId);
    });
  }

  /**
   * Відновлення клієнта
   */
  @RequirePermissions([Permission.DELETE_CONTACT])
  async restore(request: RestoreClientRequest): Promise<ApiResponse<void>> {
    return this.action(this.restore, request, RestoreClientRequestSchema, async (data) => {
      await this.restoreClientUseCase.execute(data.id, data.workspaceId);
    });
  }

  /**
   * Остаточне видалення клієнта
   */
  @RequirePermissions([Permission.DELETE_CONTACT])
  async hardDelete(
    request: HardDeleteClientRequest,
  ): Promise<ApiResponse<void>> {
    return this.action(this.hardDelete, request, HardDeleteClientRequestSchema, async (data) => {
      await this.hardDeleteClientUseCase.execute(data.id, data.workspaceId);
    });
  }
}

export const clientController = new ClientController();
