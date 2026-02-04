import { WorkspaceUser } from '@/backend/domain/entities/workspace-user.entity';
import { WorkspaceUserStatus } from '@/backend/domain/value-objects/workspace-user-status.enum';
import { Role } from '@/backend/domain/value-objects/role.vo';

type DbWorkspaceUser = {
  workspaceId: string;
  userId: string;
  role: string;
  status: string;
  joinedAt: Date;
};

export class WorkspaceUserMapper {
  static toDomain(raw: DbWorkspaceUser): WorkspaceUser {
    return WorkspaceUser.create({
      workspaceId: raw.workspaceId,
      userId: raw.userId,
      role: Role.fromName(raw.role),
      status: raw.status as WorkspaceUserStatus,
      joinedAt: raw.joinedAt,
    });
  }
}
