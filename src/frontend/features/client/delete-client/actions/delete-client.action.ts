"use server";

import { revalidatePath } from "next/cache";
import { clientController } from "@/backend/api/controllers";
import { dashboardRoutes } from "@/shared/routes/dashboard-routes";
import type { ApiResponse } from "@/backend/api/contracts/base.contracts";

/**
 * Server Action для м'якого видалення клієнта.
 */
export async function deleteClientAction(
  clientId: string,
  workspaceId: string,
  workspaceSlug: string,
): Promise<ApiResponse<void>> {
  const result = await clientController.delete({ id: clientId, workspaceId });

  if (result.success) {
    revalidatePath(dashboardRoutes.clients(workspaceSlug));
  }

  return result;
}
