"use server";

import { clientController } from "@/backend/api/controllers";
import type {
  GetClientDetailsRequest,
  ClientDetailsResponse,
} from "@/backend/api/contracts/client.contracts";
import type { ApiResponse } from "@/backend/api/contracts/base.contracts";

/**
 * Server Action для отримання повної інформації про клієнта.
 */
export async function getClientDetailsAction(
  request: GetClientDetailsRequest,
): Promise<ApiResponse<ClientDetailsResponse>> {
  return await clientController.getDetails(request);
}
