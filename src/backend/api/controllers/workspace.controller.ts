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
  DeleteWorkspaceRequestSchema,
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
    // Тут права не перевіряються автоматично через action, бо немає існуючого workspaceId
    return this.action(this.create, request, CreateWorkspaceRequestSchema, async (data, user) => {
      const workspace = await this.createWorkspaceUseCase.execute({
        name: data.name,
        userId: user.id,
      });


      return this.mapper.toCreateResponse(workspace);
    });
  }

  /**
   * Отримання списку воркспейсів поточного користувача.
   */
  async getMyWorkspaces(): Promise<ApiResponse<GetWorkspacesResponse>> {
    // Для отримання списку схема не потрібна
    return this.action(this.getMyWorkspaces, {}, null, async (_, user) => {
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
    // Тут workspaceId передається як 'id' у запиті, action автоматично це підхопить
    return this.action(this.delete, request, DeleteWorkspaceRequestSchema, async (data, user) => {
      await this.deleteWorkspaceUseCase.execute({
        workspaceId: data.id,
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
    return this.action(this.hardDelete, request, HardDeleteWorkspaceRequestSchema, async (data, user) => {
      await this.hardDeleteWorkspaceUseCase.execute({
        workspaceId: data.id,
        userId: user.id,
      });
    });
  }
}

export const workspaceController = new WorkspaceController();
