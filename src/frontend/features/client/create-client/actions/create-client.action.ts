"use server";

import { revalidatePath } from "next/cache";
import { container } from "@/backend/infrastructure/di/container";
import { CreateClientUseCase } from "@/backend/application/use-cases/clients/create-client.use-case";
import { IAuthService } from "@/backend/application/interfaces/services/auth.service.interface";
import { createClientSchema } from "@/frontend/entities/client/model/schema";
import { CreateClient } from "@/frontend/entities/client/model/types";
import { ClientType } from "@/backend/domain/value-objects/client-type.enum";
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
 * Server Action для створення нового клієнта.
 * Використовує Clean Architecture на бекенді.
 */
export async function createClientAction(
  data: CreateClient,
  workspaceSlug: string,
): Promise<{ 
  success: boolean; 
  error: string | null;
  validationErrors?: Record<string, string>;
}> {
  try {
    // 1. Отримуємо залежності з контейнера
    const createClientUseCase = container.resolve(CreateClientUseCase);
    const authService = container.resolve<IAuthService>("IAuthService");

    // 2. Безпека: перевірка автентифікації
    const user = await authService.getCurrentUser();
    if (!user) {
      return { success: false, error: "Користувач не автентифікований" };
    }

    // 3. Валідація даних схемою Zod (Server-side)
    const validationResult = createClientSchema.safeParse(data);
    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error.format());
      return {
        success: false,
        error: "Некоректні дані: " + validationResult.error.message,
      };
    }

    const validatedData = validationResult.data;

    // 4. Підготовка DTO з конвертацією типів (напр. рядки у дати)
    const baseFields = {
      workspaceId: validatedData.workspaceId,
      email: validatedData.email || null,
      phone: validatedData.phone || null,
      address: validatedData.address || null,
      note: validatedData.note || null,
      createdBy: user.id,
    };

    if (validatedData.clientType === "individual") {
      // Конвертація паспортних даних
      let passportDetails = null;
      if (validatedData.passportDetails) {
        const pd = validatedData.passportDetails;
        // Перевіряємо, чи є хоча б якісь дані, окрім порожніх рядків
        const hasData = pd.series || pd.number || pd.issuedBy || pd.issuedDate;

        if (hasData) {
          const issuedDate = toDate(pd.issuedDate);

          // Якщо дата обов'язкова в домені, перевіряємо її
          if (!issuedDate) {
            // Можна або проігнорувати весь блок, або повернути помилку.
            // Оскільки в домені issuedDate: Date (не null), вона обов'язкова якщо є об'єкт.
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

      await createClientUseCase.execute({
        ...baseFields,
        clientType: ClientType.INDIVIDUAL,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        middleName: validatedData.middleName || null,
        dateOfBirth: toDate(validatedData.dateOfBirth),
        taxNumber: validatedData.taxNumber || null,
        isFop: validatedData.isFop,
        passportDetails,
      });
    } else {
      await createClientUseCase.execute({
        ...baseFields,
        clientType: ClientType.COMPANY,
        companyName: validatedData.companyName,
        taxId: validatedData.taxId || null,
      });
    }

    // 5. Оновлення кешу сторінок
    revalidatePath(dashboardRoutes.clients(workspaceSlug));

    return { success: true, error: null };
  } catch (error) {
    console.error("Create client action error:", error);

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
      error instanceof Error ? error.message : "Не вдалося створити клієнта";

    return {
      success: false,
      error: errorMessage,
    };
  }
}
