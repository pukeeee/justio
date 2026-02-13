"use server";

import { revalidatePath } from "next/cache";
import { clientController } from "@/backend/api/controllers";
import type { CreateClientRequest, CreateClientResponse } from "@/backend/api/contracts/client.contracts";
import type { ApiResponse } from "@/backend/api/contracts/base.contracts";
import { dashboardRoutes } from "@/shared/routes/dashboard-routes";

/**
 * Server Action для створення нового клієнта.
 * Рефакторинг: Повертає уніфікований ApiResponse.
 */
export async function createClientAction(
  data: CreateClientRequest,
  workspaceSlug: string,
): Promise<ApiResponse<CreateClientResponse>> {
  // 1. Виклик API контролера
  const result = await clientController.create(data);

  // 2. Інвалідація кешу при успіху
  if (result.success) {
    revalidatePath(dashboardRoutes.clients(workspaceSlug));
  }

  // 3. Повернення уніфікованого результату
  return result;
}
