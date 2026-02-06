import { injectable } from 'tsyringe';
import { eq, and } from 'drizzle-orm';
import { db } from '../drizzle/client';
import { users, workspaceUsers } from '../drizzle/schema';
import { IAuthRepository } from '@/backend/application/interfaces/repositories/auth.repository.interface';
import { User } from '@/backend/domain/entities/user.entity';
import { WorkspaceUser } from '@/backend/domain/entities/workspace-user.entity';
import { UserMapper } from '../mappers/user.mapper';
import { WorkspaceUserMapper } from '../mappers/workspace-user.mapper';

@injectable()
export class DrizzleAuthRepository implements IAuthRepository {
  async findUserById(userId: string): Promise<User | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return row ? UserMapper.toDomain(row) : null;
  }

  async findWorkspaceUser(
    userId: string,
    workspaceId: string
  ): Promise<WorkspaceUser | null> {
    const [row] = await db
      .select()
      .from(workspaceUsers)
      .where(
        and(
          eq(workspaceUsers.userId, userId),
          eq(workspaceUsers.workspaceId, workspaceId)
        )
      )
      .limit(1);

    return row ? WorkspaceUserMapper.toDomain(row) : null;
  }
}
