"use server";

import { revalidatePath } from "next/cache";
import { createWorkspace } from "@/shared/services/workspace.service";
import { Database } from "@/shared/lib/types/database";
import { CreateWorkspaceSchema } from "@/shared/lib/validations/schemas";

type Workspace = Pick<
  Database["public"]["Tables"]["workspaces"]["Row"],
  "id" | "name" | "slug"
>;

type FormState = {
  workspace: Workspace | null;
  error: string | null;
};

/**
 * Server Action для створення воркспейсу
 */
export async function createWorkspaceAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    // Валідація
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

    // Створюємо через сервіс (з перевіркою квоти)
    const { workspace, error } = await createWorkspace(name);

    if (error || !workspace) {
      return {
        workspace: null,
        error: error || "Не вдалося створити воркспейс",
      };
    }

    // Інвалідуємо кеш
    revalidatePath("/user/workspace");
    revalidatePath("/dashboard");

    return {
      workspace,
      error: null,
    };
  } catch (error) {
    console.error("Create workspace action error:", error);
    return {
      workspace: null,
      error: "Виникла несподівана помилка",
    };
  }
}
