"use server";

import { clientController } from "@/backend/api/controllers";
import type { GetClientsResponse, GetClientsRequest } from "@/backend/api/contracts/client.contracts";
import type { ApiResponse } from "@/backend/api/contracts/base.contracts";

/**
 * Server Action для отримання списку клієнтів.
 */
export async function getClientsAction(
  request: GetClientsRequest
): Promise<ApiResponse<GetClientsResponse>> {
  return await clientController.getList(request);
}
