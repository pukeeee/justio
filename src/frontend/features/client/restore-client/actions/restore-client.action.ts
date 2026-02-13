"use server";

import { revalidatePath } from "next/cache";
import { clientController } from "@/backend/api/controllers";
import { dashboardRoutes } from "@/shared/routes/dashboard-routes";
import type { ApiResponse } from "@/backend/api/contracts/base.contracts";

/**
 * Server Action для відновлення клієнта з кошика.
 */
export async function restoreClientAction(
  clientId: string,
  workspaceId: string,
  workspaceSlug: string,
): Promise<ApiResponse<void>> {
  const result = await clientController.restore({ id: clientId, workspaceId });

  if (result.success) {
    revalidatePath(dashboardRoutes.clients(workspaceSlug));
    revalidatePath(dashboardRoutes.bin(workspaceSlug));
  }

  return result;
}
