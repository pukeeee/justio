"use server";

import * as WorkspaceService from "@/shared/services/workspace.service";

/**
 * Серверна дія для отримання всіх воркспейсів поточного користувача.
 */
export async function getWorkspaces() {
  return await WorkspaceService.getUserWorkspaces();
}
