"use server";

import { revalidatePath } from "next/cache";
import { workspaceController } from "@/backend/api/controllers";
import type {
  CreateWorkspaceRequest,
  CreateWorkspaceResponse,
} from "@/backend/api/contracts/workspace.contracts";
import type { ApiResponse } from "@/backend/api/contracts/base.contracts";
import { userRoutes } from "@/shared/routes/user-routes";
import { dashboardRoutes } from "@/shared/routes/dashboard-routes";

/**
 * Server Action для створення нового воркспейсу.
 * Використовує WorkspaceController для обробки бізнес-логіки.
 */
export async function createWorkspaceAction(
  data: CreateWorkspaceRequest,
): Promise<ApiResponse<CreateWorkspaceResponse>> {
  // 1. Виклик контролера
  const result = await workspaceController.create(data);

  // 2. Інвалідація кешу при успіху
  if (result.success) {
    revalidatePath(userRoutes.workspace);
    revalidatePath(dashboardRoutes.root(result.data?.slug || ""));
  }

  // 3. Повернення результату
  return result;
}
