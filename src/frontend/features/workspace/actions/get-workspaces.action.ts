"use server";

import { workspaceController } from "@/backend/api/controllers";
import type { GetWorkspacesResponse } from "@/backend/api/contracts/workspace.contracts";
import type { ApiResponse } from "@/backend/api/contracts/base.contracts";

/**
 * Server Action для отримання списку воркспейсів поточного користувача.
 */
export async function getWorkspacesAction(): Promise<ApiResponse<GetWorkspacesResponse>> {
  return await workspaceController.getMyWorkspaces();
}
