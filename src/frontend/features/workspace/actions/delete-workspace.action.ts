"use server";

import { revalidatePath } from "next/cache";
import { workspaceController } from "@/backend/api/controllers";
import type { DeleteWorkspaceRequest } from "@/backend/api/contracts/workspace.contracts";
import type { ApiResponse } from "@/backend/api/contracts/base.contracts";
import { userRoutes } from "@/shared/routes/user-routes";
import { dashboardRoutes } from "@/shared/routes/dashboard-routes";

/**
 * Server Action для видалення воркспейсу.
 */
export async function deleteWorkspaceAction(
  request: DeleteWorkspaceRequest,
): Promise<ApiResponse<void>> {
  const result = await workspaceController.delete(request);

  if (result.success) {
    revalidatePath(userRoutes.workspace);
    revalidatePath(dashboardRoutes.root(""), "layout");
  }

  return result;
}
