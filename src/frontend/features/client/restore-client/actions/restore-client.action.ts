"use server";

import { container } from "@/backend/infrastructure/di/container";
import { RestoreClientUseCase } from "@/backend/application/use-cases/clients/restore-client.use-case";
import { revalidatePath } from "next/cache";
import { dashboardRoutes } from "@/shared/routes/dashboard-routes";
import { getUserWorkspaces } from "@/frontend/shared/lib/auth/get-user-data";

/**
 * Server Action для відновлення клієнта з кошика.
 */
export async function restoreClientAction(
  clientId: string,
  workspaceSlug: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const workspaces = await getUserWorkspaces();
    const workspace = workspaces.find((w) => w.slug === workspaceSlug);

    if (!workspace) {
      return { success: false, error: "Доступ до воркспейсу заборонено" };
    }

    const restoreClientUseCase = container.resolve(RestoreClientUseCase);

    await restoreClientUseCase.execute(clientId, workspace.id);

    // Ревалідуємо список клієнтів у конкретному воркспейсі за його slug
    revalidatePath(dashboardRoutes.clients(workspaceSlug));
    revalidatePath(dashboardRoutes.bin(workspaceSlug));

    return { success: true };
  } catch (error: unknown) {
    console.error("Restore client action error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Помилка при відновленні клієнта",
    };
  }
}
