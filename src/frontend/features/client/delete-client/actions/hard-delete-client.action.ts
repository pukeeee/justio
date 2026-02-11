"use server";

import { container } from "@/backend/infrastructure/di/container";
import { HardDeleteClientUseCase } from "@/backend/application/use-cases/clients/hard-delete-client.use-case";
import { revalidatePath } from "next/cache";
import { dashboardRoutes } from "@/shared/routes/dashboard-routes";
import { getUserWorkspaces } from "@/frontend/shared/lib/auth/get-user-data";

/**
 * Server Action для остаточного видалення клієнта.
 */
export async function hardDeleteClientAction(
  clientId: string,
  workspaceSlug: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const workspaces = await getUserWorkspaces();
    const workspace = workspaces.find((w) => w.slug === workspaceSlug);

    if (!workspace) {
      return { success: false, error: "Доступ до воркспейсу заборонено" };
    }

    const hardDeleteClientUseCase = container.resolve(HardDeleteClientUseCase);
    
    await hardDeleteClientUseCase.execute(clientId, workspace.id);

    // Ревалідуємо сторінку кошика
    revalidatePath(dashboardRoutes.bin(workspaceSlug));

    return { success: true };
  } catch (error: unknown) {
    console.error("Hard delete client action error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Помилка при остаточному видаленні" 
    };
  }
}
