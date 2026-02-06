"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { container } from "@/backend/infrastructure/di/container";
import { DeleteWorkspaceUseCase } from "@/backend/application/use-cases/workspace/delete-workspace.use-case";
import { IAuthService } from "@/backend/application/interfaces/services/auth.service.interface";

/**
 * @description Визначає структуру об'єкта, що повертається Server Action для відображення стану операції у формі.
 */
export type FormState = {
  isSuccess: boolean;
  isError: boolean;
  message: string;
};

/**
 * Server Action для безпечного видалення воркспейсу через Clean Architecture.
 */
export async function deleteWorkspaceAction(
  workspaceId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!workspaceId) {
    return {
      isSuccess: false,
      isError: true,
      message: "Помилка: ID воркспейсу не вказано.",
    };
  }

  try {
    // 1. Отримуємо залежності
    const deleteWorkspaceUseCase = container.resolve(DeleteWorkspaceUseCase);
    const authService = container.resolve<IAuthService>("IAuthService");

    // 2. Автентифікація
    const user = await authService.getCurrentUser();
    if (!user) {
      return {
        isSuccess: false,
        isError: true,
        message: "Користувач не автентифікований",
      };
    }

    // 3. Виклик бізнес-логіки
    await deleteWorkspaceUseCase.execute({
      workspaceId,
      userId: user.id,
    });

  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Сталася несподівана помилка.";
    return {
      isSuccess: false,
      isError: true,
      message: errorMessage,
    };
  }

  // 4. Очищення кешу
  revalidatePath("/user/workspace");
  revalidatePath("/dashboard", "layout");

  // 5. Перенаправлення
  redirect("/user/workspace");
}
