"use server";

import { revalidatePath } from "next/cache";
import { clientController } from "@/backend/api/controllers";
import { dashboardRoutes } from "@/shared/routes/dashboard-routes";
import type { ApiResponse } from "@/backend/api/contracts/base.contracts";

/**
 * Server Action для остаточного видалення клієнта.
 */
export async function hardDeleteClientAction(
  clientId: string,
  workspaceId: string,
  workspaceSlug: string,
): Promise<ApiResponse<void>> {
  const result = await clientController.hardDelete({ id: clientId, workspaceId });

  if (result.success) {
    revalidatePath(dashboardRoutes.bin(workspaceSlug));
  }

  return result;
}
