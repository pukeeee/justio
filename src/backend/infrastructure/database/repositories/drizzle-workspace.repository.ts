import { injectable } from 'tsyringe';
import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../drizzle/client';
import { workspaces, workspaceUsers } from '../drizzle/schema';
import { IWorkspaceRepository } from '@/backend/application/interfaces/repositories/workspace.repository.interface';
import { Workspace } from '@/backend/domain/entities/workspace.entity';
import { WorkspaceMapper } from '../mappers/workspace.mapper';

@injectable()
export class DrizzleWorkspaceRepository implements IWorkspaceRepository {
  async findAllByUserId(userId: string): Promise<Workspace[]> {
    const rows = await db
      .select({
        workspace: workspaces,
      })
      .from(workspaceUsers)
      .innerJoin(workspaces, eq(workspaceUsers.workspaceId, workspaces.id))
      .where(
        and(
          eq(workspaceUsers.userId, userId),
          eq(workspaceUsers.status, 'active'),
          isNull(workspaces.deletedAt)
        )
      );

    return rows.map((row) => WorkspaceMapper.toDomain(row.workspace));
  }

  async findById(workspaceId: string): Promise<Workspace | null> {
    const [row] = await db
      .select()
      .from(workspaces)
      .where(and(eq(workspaces.id, workspaceId), isNull(workspaces.deletedAt)))
      .limit(1);
    
    return row ? WorkspaceMapper.toDomain(row) : null;
  }

  async findByIdIncludeDeleted(workspaceId: string): Promise<Workspace | null> {
    const [row] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);
    
    return row ? WorkspaceMapper.toDomain(row) : null;
  }

  async findBySlug(slug: string): Promise<Workspace | null> {
    const [row] = await db
      .select()
      .from(workspaces)
      .where(and(eq(workspaces.slug, slug), isNull(workspaces.deletedAt)))
      .limit(1);

    return row ? WorkspaceMapper.toDomain(row) : null;
  }

  async save(workspace: Workspace): Promise<void> {
    const persistence = WorkspaceMapper.toPersistence(workspace);

    await db.transaction(async (tx) => {
      // 1. Створюємо або оновлюємо воркспейс
      await tx
        .insert(workspaces)
        .values(persistence)
        .onConflictDoUpdate({
          target: workspaces.id,
          set: {
            name: persistence.name,
            slug: persistence.slug,
            tier: persistence.tier,
            settings: persistence.settings,
            updatedAt: new Date(),
            deletedAt: persistence.deletedAt,
          },
        });

      // 2. Якщо це новий воркспейс, додаємо власника
      // Ми використовуємо onConflictDoNothing, щоб не зламати оновлення існуючого
      await tx
        .insert(workspaceUsers)
        .values({
          workspaceId: workspace.id,
          userId: workspace.ownerId,
          role: 'owner',
          status: 'active',
        })
        .onConflictDoNothing();
    });
  }

  async softDelete(workspaceId: string): Promise<void> {
    await db
      .update(workspaces)
      .set({ deletedAt: new Date() })
      .where(eq(workspaces.id, workspaceId));
  }

  async restore(workspaceId: string): Promise<void> {
    await db
      .update(workspaces)
      .set({ deletedAt: null })
      .where(eq(workspaces.id, workspaceId));
  }

  async hardDelete(workspaceId: string): Promise<void> {
    await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
  }
}
