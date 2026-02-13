import { BaseController } from "./base.controller";
import { container } from "@/backend/infrastructure/di/container";
import { CreateWorkspaceUseCase } from "@/backend/application/use-cases/workspace/create-workspace.use-case";
import { GetMyWorkspacesUseCase } from "@/backend/application/use-cases/workspace/get-my-workspaces.use-case";
import { DeleteWorkspaceUseCase } from "@/backend/application/use-cases/workspace/delete-workspace.use-case";
import { HardDeleteWorkspaceUseCase } from "@/backend/application/use-cases/workspace/hard-delete-workspace.use-case";
import { WorkspaceMapper } from "../mappers/workspace.mapper";
import type { ApiResponse } from "../contracts/base.contracts";
import {
  CreateWorkspaceRequestSchema,
  HardDeleteWorkspaceRequestSchema,
} from "../contracts/workspace.contracts";
import type {
  CreateWorkspaceRequest,
  CreateWorkspaceResponse,
  GetWorkspacesResponse,
  DeleteWorkspaceRequest,
  HardDeleteWorkspaceRequest,
} from "../contracts/workspace.contracts";
import { Permission } from "@/backend/domain/value-objects/permission.enum";
import { RequirePermissions } from "../middleware/permission.guard";

/**
 * Контролер для роботи з робочими просторами (Workspace).
 */
export class WorkspaceController extends BaseController {
  private createWorkspaceUseCase: CreateWorkspaceUseCase;
  private getMyWorkspacesUseCase: GetMyWorkspacesUseCase;
  private deleteWorkspaceUseCase: DeleteWorkspaceUseCase;
  private hardDeleteWorkspaceUseCase: HardDeleteWorkspaceUseCase;
  private mapper: WorkspaceMapper;

  constructor() {
    super();
    this.createWorkspaceUseCase = container.resolve(CreateWorkspaceUseCase);
    this.getMyWorkspacesUseCase = container.resolve(GetMyWorkspacesUseCase);
    this.deleteWorkspaceUseCase = container.resolve(DeleteWorkspaceUseCase);
    this.hardDeleteWorkspaceUseCase = container.resolve(
      HardDeleteWorkspaceUseCase,
    );
    this.mapper = new WorkspaceMapper();
  }

  /**
   * Створення нового воркспейсу.
   */
  async create(
    request: CreateWorkspaceRequest,
  ): Promise<ApiResponse<CreateWorkspaceResponse>> {
    return this.execute(async () => {
      // 1. Валідація
      const validatedRequest = CreateWorkspaceRequestSchema.parse(request);

      // 2. Автентифікація
      const user = await this.getCurrentUserOrThrow();

      // 3. Виклик Use Case
      const workspace = await this.createWorkspaceUseCase.execute({
        name: validatedRequest.name,
        userId: user.id,
      });

      // 4. Маппінг
      return this.mapper.toCreateResponse(workspace);
    });
  }

  /**
   * Отримання списку воркспейсів поточного користувача.
   */
  async getMyWorkspaces(): Promise<ApiResponse<GetWorkspacesResponse>> {
    return this.execute(async () => {
      const user = await this.getCurrentUserOrThrow();

      const workspaces = await this.getMyWorkspacesUseCase.execute(user.id);

      return {
        items: this.mapper.toListResponse(workspaces),
      };
    });
  }

  /**
   * Видалення воркспейсу (м'яке).
   */
  @RequirePermissions([Permission.DELETE_WORKSPACE])
  async delete(request: DeleteWorkspaceRequest): Promise<ApiResponse<void>> {
    return this.execute(async () => {
      const user = await this.getCurrentUserOrThrow();

      // Перевірка прав доступу
      await this.checkMethodPermissions(this.delete, user.id, request.id);

      await this.deleteWorkspaceUseCase.execute({
        workspaceId: request.id,
        userId: user.id,
      });
    });
  }

  /**
   * Повне видалення воркспейсу (hard delete).
   */
  @RequirePermissions([Permission.DELETE_WORKSPACE])
  async hardDelete(
    request: HardDeleteWorkspaceRequest,
  ): Promise<ApiResponse<void>> {
    return this.execute(async () => {
      // 1. Валідація
      const validatedRequest = HardDeleteWorkspaceRequestSchema.parse(request);

      // 2. Автентифікація
      const user = await this.getCurrentUserOrThrow();

      // 3. Перевірка прав доступу
      await this.checkMethodPermissions(
        this.hardDelete,
        user.id,
        validatedRequest.id,
      );

      // 4. Виклик Use Case
      await this.hardDeleteWorkspaceUseCase.execute({
        workspaceId: validatedRequest.id,
        userId: user.id,
      });
    });
  }
}

/**
 * Singleton instance.
 */
export const workspaceController = new WorkspaceController();
