"use server";

import { revalidatePath } from "next/cache";
import { container } from "@/backend/infrastructure/di/container";
import { CreateWorkspaceUseCase } from "@/backend/application/use-cases/workspace/create-workspace.use-case";
import { IAuthService } from "@/backend/application/interfaces/services/auth.service.interface";
import { CreateWorkspaceSchema } from "@/frontend/shared/lib/validations/schemas";

type FormState = {
  workspace: { id: string; name: string; slug: string } | null;
  error: string | null;
};

/**
 * Server Action для створення воркспейсу через Clean Architecture
 */
export async function createWorkspaceAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    // 1. Отримуємо залежності з контейнера
    const createWorkspaceUseCase = container.resolve(CreateWorkspaceUseCase);
    const authService = container.resolve<IAuthService>("IAuthService");

    // 2. Автентифікація
    const user = await authService.getCurrentUser();
    if (!user) {
      return { workspace: null, error: "Користувач не автентифікований" };
    }

    // 3. Валідація полів
    const validatedFields = CreateWorkspaceSchema.safeParse({
      name: formData.get("name"),
    });

    if (!validatedFields.success) {
      return {
        workspace: null,
        error: validatedFields.error.message,
      };
    }

    const { name } = validatedFields.data;

    // 4. Виклик бізнес-логіки
    const workspace = await createWorkspaceUseCase.execute({
      name,
      userId: user.id,
    });

    // 5. Інвалідуємо кеш
    revalidatePath("/user/workspace");
    revalidatePath("/dashboard");

    return {
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
      },
      error: null,
    };
  } catch (error) {
    console.error("Create workspace action error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Виникла несподівана помилка";
    return {
      workspace: null,
      error: errorMessage,
    };
  }
}
