"use server";

import { container } from "@/backend/infrastructure/di/container";
import { HardDeleteClientUseCase } from "@/backend/application/use-cases/clients/hard-delete-client.use-case";
import { revalidatePath } from "next/cache";

/**
 * Server Action для остаточного видалення клієнта.
 */
export async function hardDeleteClientAction(
  clientId: string,
  workspaceId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const hardDeleteClientUseCase = container.resolve(HardDeleteClientUseCase);
    
    await hardDeleteClientUseCase.execute(clientId);

    // Ревалідуємо сторінку кошика
    revalidatePath(`/dashboard/${workspaceId}/bin`);

    return { success: true };
  } catch (error: unknown) {
    console.error("Hard delete client action error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Помилка при остаточному видаленні" 
    };
  }
}
