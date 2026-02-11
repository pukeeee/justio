"use server";

import { container } from "@/backend/infrastructure/di/container";
import { DeleteClientUseCase } from "@/backend/application/use-cases/clients/delete-client.use-case";
import { revalidatePath } from "next/cache";
import { dashboardRoutes } from "@/shared/routes/dashboard-routes";
import { getUserWorkspaces } from "@/frontend/shared/lib/auth/get-user-data";

/**
 * Server Action для м'якого видалення клієнта.
 * @param clientId ID клієнта
 * @param workspaceSlug Slug воркспейсу для ревалідації та безпеки
 */
export async function deleteClientAction(
  clientId: string,
  workspaceSlug: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const workspaces = await getUserWorkspaces();
    const workspace = workspaces.find((w) => w.slug === workspaceSlug);

    if (!workspace) {
      return { success: false, error: "Доступ до воркспейсу заборонено" };
    }

    const deleteClientUseCase = container.resolve(DeleteClientUseCase);
    await deleteClientUseCase.execute(clientId, workspace.id);

    // Ревалідуємо список клієнтів у конкретному воркспейсі
    revalidatePath(dashboardRoutes.clients(workspaceSlug));

    return { success: true };
  } catch (error: unknown) {
    console.error("Delete client action error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Помилка при видаленні клієнта",
    };
  }
}
