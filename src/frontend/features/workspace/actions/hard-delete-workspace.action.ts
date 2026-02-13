"use server";

import { revalidatePath } from "next/cache";
import { workspaceController } from "@/backend/api/controllers";
import type { HardDeleteWorkspaceRequest } from "@/backend/api/contracts/workspace.contracts";
import type { ApiResponse } from "@/backend/api/contracts/base.contracts";

/**
 * Server Action для повного видалення воркспейсу.
 * УВАГА: Це незворотня операція!
 */
export async function hardDeleteWorkspaceAction(
  request: HardDeleteWorkspaceRequest,
): Promise<ApiResponse<void>> {
  const result = await workspaceController.hardDelete(request);

  if (result.success) {
    // Після повного видалення воркспейс зникає всюди
    revalidatePath("/user/workspace");
    revalidatePath("/dashboard", "layout");
  }

  return result;
}
