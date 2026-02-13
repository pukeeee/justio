import { Workspace } from "@/backend/domain/entities/workspace.entity";
import type {
  CreateWorkspaceResponse,
  WorkspaceListItem,
} from "../contracts/workspace.contracts";

/**
 * Mapper для воркспейсів.
 */
export class WorkspaceMapper {
  /**
   * Domain → CreateWorkspaceResponse
   */
  toCreateResponse(workspace: Workspace): CreateWorkspaceResponse {
    return {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug.value,
      createdAt: workspace.createdAt.toISOString(),
    };
  }

  /**
   * Domain[] → WorkspaceListItem[]
   */
  toListResponse(workspaces: Workspace[]): WorkspaceListItem[] {
    return workspaces.map((w) => ({
      id: w.id,
      name: w.name,
      slug: w.slug.value,
      // На даному етапі ми припускаємо, що якщо юзер отримує список своїх воркспейсів,
      // то він є власником або адміном. У майбутньому роль буде братися з БД.
      role: "owner",
    }));
  }
}
