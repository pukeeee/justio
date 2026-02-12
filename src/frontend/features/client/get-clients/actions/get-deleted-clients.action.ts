"use server";

import { clientController } from "@/backend/api/controllers";
import type { GetClientsResponse } from "@/backend/api/contracts/client.contracts";
import type { ApiResponse } from "@/backend/api/contracts/base.contracts";

/**
 * Server Action для отримання списку видалених клієнтів.
 */
export async function getDeletedClientsAction(
  workspaceId: string,
): Promise<ApiResponse<GetClientsResponse>> {
  return await clientController.getList({
    workspaceId,
    onlyDeleted: true,
    limit: 100,
    offset: 0,
  });
}
