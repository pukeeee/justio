"use server";

import { revalidatePath } from "next/cache";
import { container } from "@/backend/infrastructure/di/container";
import { UpdateClientUseCase } from "@/backend/application/use-cases/clients/update-client.use-case";
import { IAuthService } from "@/backend/application/interfaces/services/auth.service.interface";
import { updateClientSchema } from "@/frontend/entities/client/model/schema";
import { UpdateClient } from "@/frontend/entities/client/model/types";
import { DuplicateEntityError } from "@/backend/domain/errors/invalid-data.error";
import { dashboardRoutes } from "@/shared/routes/dashboard-routes";

/**
 * @description Допоміжна функція для конвертації значень у дату
 */
const toDate = (val: string | Date | null | undefined): Date | null => {
  if (!val || val === "") return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Server Action для оновлення існуючого клієнта.
 */
export async function updateClientAction(
  data: UpdateClient,
  workspaceSlug: string,
): Promise<{ 
  success: boolean; 
  error: string | null;
  validationErrors?: Record<string, string>;
}> {
  try {
    // 1. Отримуємо залежності з контейнера
    const updateClientUseCase = container.resolve(UpdateClientUseCase);
    const authService = container.resolve<IAuthService>("IAuthService");

    // 2. Безпека: перевірка автентифікації
    const user = await authService.getCurrentUser();
    if (!user) {
      return { success: false, error: "Користувач не автентифікований" };
    }

    // 3. Валідація даних схемою Zod (Server-side)
    const validationResult = updateClientSchema.safeParse(data);
    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error.format());
      return {
        success: false,
        error: "Некоректні дані: " + validationResult.error.message,
      };
    }

    const validatedData = validationResult.data;

    // 4. Підготовка DTO з конвертацією типів
    const baseFields = {
      id: validatedData.id,
      email: validatedData.email || null,
      phone: validatedData.phone || null,
      address: validatedData.address || null,
      note: validatedData.note || null,
    };

    if (validatedData.clientType === "individual") {
      // Конвертація паспортних даних
      let passportDetails = null;
      if (validatedData.passportDetails) {
        const pd = validatedData.passportDetails;
        const hasData = pd.series || pd.number || pd.issuedBy || pd.issuedDate;

        if (hasData) {
          const issuedDate = toDate(pd.issuedDate);
          if (!issuedDate) {
            if (pd.number || pd.issuedBy) {
              return {
                success: false,
                error:
                  "Дата видачі паспорта обов'язкова, якщо заповнено інші поля паспорта",
                validationErrors: {
                  "passportDetails.issuedDate": "Дата видачі обов'язкова",
                }
              };
            }
          } else {
            passportDetails = {
              series: pd.series || null,
              number: pd.number || "",
              issuedBy: pd.issuedBy || "",
              issuedDate: issuedDate,
            };
          }
        }
      }

      await updateClientUseCase.execute({
        ...baseFields,
        // clientType не оновлюється через UseCase, але потрібен для логіки DTO
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        middleName: validatedData.middleName || null,
        dateOfBirth: toDate(validatedData.dateOfBirth),
        taxNumber: validatedData.taxNumber || null,
        isFop: validatedData.isFop,
        passportDetails,
      });
    } else {
      await updateClientUseCase.execute({
        ...baseFields,
        companyName: validatedData.companyName,
        taxId: validatedData.taxId || null,
      });
    }

    // 5. Оновлення кешу сторінок
    revalidatePath(dashboardRoutes.clients(workspaceSlug));

    return { success: true, error: null };
  } catch (error) {
    console.error("Update client action error:", error);

    if (error instanceof DuplicateEntityError && error.fieldKey) {
      return {
        success: false,
        error: error.message,
        validationErrors: {
          [error.fieldKey]: error.message
        }
      };
    }

    const errorMessage =
      error instanceof Error ? error.message : "Не вдалося оновити клієнта";

    return {
      success: false,
      error: errorMessage,
    };
  }
}
