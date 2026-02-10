"use server";

import { container } from "@/backend/infrastructure/di/container";
import { DeleteClientUseCase } from "@/backend/application/use-cases/clients/delete-client.use-case";
import { revalidatePath } from "next/cache";

/**
 * Server Action для м'якого видалення клієнта.
 * @param clientId ID клієнта
 * @param workspaceId ID воркспейсу для ревалідації
 */
export async function deleteClientAction(
  clientId: string,
  workspaceId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const deleteClientUseCase = container.resolve(DeleteClientUseCase);

    await deleteClientUseCase.execute(clientId);

    // Ревалідуємо список клієнтів у конкретному воркспейсі
    revalidatePath(`/dashboard/${workspaceId}/clients`);

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
