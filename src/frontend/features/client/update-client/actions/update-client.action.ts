"use server";

import { revalidatePath } from "next/cache";
import { clientController } from "@/backend/api/controllers";
import type { UpdateClientRequest, UpdateClientResponse } from "@/backend/api/contracts/client.contracts";
import type { ApiResponse } from "@/backend/api/contracts/base.contracts";
import { dashboardRoutes } from "@/shared/routes/dashboard-routes";

/**
 * Server Action для оновлення існуючого клієнта.
 */
export async function updateClientAction(
  data: UpdateClientRequest,
  workspaceSlug: string,
): Promise<ApiResponse<UpdateClientResponse>> {
  // 1. Виклик контролера
  const result = await clientController.update(data);

  // 2. Інвалідація кешу при успіху
  if (result.success) {
    revalidatePath(dashboardRoutes.clients(workspaceSlug));
    revalidatePath(dashboardRoutes.clients(workspaceSlug) + `/${data.id}`);
  }

  return result;
}
