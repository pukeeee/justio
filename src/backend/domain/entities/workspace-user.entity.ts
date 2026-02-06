import { Role } from '../value-objects/role.vo';
import { Permission } from '../value-objects/permission.enum';
import { WorkspaceUserStatus } from '../value-objects/workspace-user-status.enum';

/**
 * Сутність-зв'язок Користувача та Робочого простору.
 * Визначає роль та права користувача у конкретному workspace.
 */
export class WorkspaceUser {
  private constructor(
    public readonly workspaceId: string,
    public readonly userId: string,
    private _role: Role,
    private _status: WorkspaceUserStatus,
    public readonly joinedAt: Date
  ) {}

  static create(props: {
    workspaceId: string;
    userId: string;
    role: Role;
    status?: WorkspaceUserStatus;
    joinedAt?: Date;
  }): WorkspaceUser {
    return new WorkspaceUser(
      props.workspaceId,
      props.userId,
      props.role,
      props.status ?? WorkspaceUserStatus.ACTIVE,
      props.joinedAt ?? new Date()
    );
  }

  get role(): Role {
    return this._role;
  }

  get status(): WorkspaceUserStatus {
    return this._status;
  }

  hasRole(role: Role): boolean {
    return this._role.equals(role);
  }

  hasPermission(permission: Permission): boolean {
    return this._role.hasPermission(permission);
  }

  changeRole(newRole: Role): void {
    this._role = newRole;
  }
}
