import { inject, injectable } from "tsyringe";
import {
  IAuthorizationService,
  AuthorizationContext,
  ForbiddenError,
} from "../interfaces/services/authorization.service.interface";
import type { IAuthRepository } from "../interfaces/repositories/auth.repository.interface";
import type { IWorkspaceRepository } from "../interfaces/repositories/workspace.repository.interface";
import { Permission } from "@/backend/domain/value-objects/permission.enum";
import { Role } from "@/backend/domain/value-objects/role.vo";
import { WorkspaceUserStatus } from "@/backend/domain/entities/workspace-user.entity";

@injectable()
export class AuthorizationService implements IAuthorizationService {
  constructor(
    @inject("IAuthRepository")
    private readonly authRepository: IAuthRepository,
    @inject("IWorkspaceRepository")
    private readonly workspaceRepository: IWorkspaceRepository,
  ) {}

  async getUserRole(userId: string, workspaceId: string): Promise<Role | null> {
    const workspaceUser = await this.authRepository.findWorkspaceUser(
      userId,
      workspaceId,
    );

    if (!workspaceUser || workspaceUser.status !== WorkspaceUserStatus.ACTIVE) {
      return null;
    }

    return workspaceUser.role;
  }

  async getUserRoleBySlug(userId: string, slug: string): Promise<Role | null> {
    const workspace = await this.workspaceRepository.findBySlug(slug);
    if (!workspace) return null;
    return this.getUserRole(userId, workspace.id);
  }

  async canAccessWorkspace(userId: string, workspaceId: string): Promise<boolean> {
    const role = await this.getUserRole(userId, workspaceId);
    return role !== null;
  }

  async hasPermission(
    userId: string,
    permission: Permission,
    workspaceId: string
  ): Promise<boolean> {
    const role = await this.getUserRole(userId, workspaceId);
    
    if (!role) {
      return false;
    }

    return role.hasPermission(permission);
  }

  async ensureHasPermission(
    userId: string,
    permission: Permission,
    workspaceId: string
  ): Promise<void> {
    const hasPerm = await this.hasPermission(userId, permission, workspaceId);

    if (!hasPerm) {
      throw new ForbiddenError(
        `User ${userId} lacks permission ${permission} in workspace ${workspaceId}`,
      );
    }
  }

  async ensureCanAccessWorkspace(
    userId: string,
    workspaceId: string,
  ): Promise<void> {
    const canAccess = await this.canAccessWorkspace(userId, workspaceId);

    if (!canAccess) {
      throw new ForbiddenError(
        `User ${userId} cannot access workspace ${workspaceId}`,
      );
    }
  }

  async getAuthorizationContext(
    userId: string,
    workspaceId: string,
  ): Promise<AuthorizationContext | null> {
    const role = await this.getUserRole(userId, workspaceId);

    if (!role) {
      return null;
    }

    return {
      userId,
      workspaceId,
      role,
    };
  }
}
