"use server";

import { container } from "@/backend/infrastructure/di/container";
import { RestoreClientUseCase } from "@/backend/application/use-cases/clients/restore-client.use-case";
import { revalidatePath } from "next/cache";

/**
 * Server Action для відновлення клієнта з кошика.
 */
export async function restoreClientAction(
  clientId: string,
  workspaceId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const restoreClientUseCase = container.resolve(RestoreClientUseCase);

    await restoreClientUseCase.execute(clientId);

    // Ревалідуємо список клієнтів у конкретному воркспейсі
    revalidatePath(`/dashboard/${workspaceId}/clients`);

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
