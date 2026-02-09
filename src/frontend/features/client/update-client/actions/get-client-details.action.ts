"use server";

import { container } from "@/backend/infrastructure/di/container";
import { GetClientDetailsUseCase } from "@/backend/application/use-cases/clients/get-client-details.use-case";
import { IAuthService } from "@/backend/application/interfaces/services/auth.service.interface";
import { UpdateClient } from "@/frontend/entities/client/model/types";
import { ClientType } from "@/backend/domain/value-objects/client-type.enum";

/**
 * Server Action для отримання повних даних клієнта для редагування.
 * Повертає об'єкт, сумісний з формою (UpdateClient).
 */
export async function getClientDetailsAction(
  clientId: string,
): Promise<{ success: boolean; data?: UpdateClient; error?: string }> {
  try {
    const getClientDetailsUseCase = container.resolve(GetClientDetailsUseCase);
    const authService = container.resolve<IAuthService>("IAuthService");

    // Перевірка авторизації
    const user = await authService.getCurrentUser();
    if (!user) {
      return { success: false, error: "Користувач не автентифікований" };
    }

    // Отримуємо дані з домену
    const { client, individual, company } =
      await getClientDetailsUseCase.execute(clientId);

    // Мапимо доменні сутності у форму (UpdateClient)
    let formData: UpdateClient;

    if (client.clientType === ClientType.INDIVIDUAL && individual) {
      formData = {
        id: client.id,
        workspaceId: client.workspaceId,
        clientType: "individual",
        firstName: individual.firstName,
        lastName: individual.lastName,
        middleName: individual.middleName,
        email: client.email,
        phone: client.phone,
        address: client.address,
        note: client.note,
        isFop: individual.isFop,
        taxNumber: individual.taxNumber,
        dateOfBirth: individual.dateOfBirth
          ? new Date(individual.dateOfBirth).toISOString().split("T")[0]
          : null,
        passportDetails: individual.passportDetails
          ? {
              series: individual.passportDetails.series || "",
              number: individual.passportDetails.number || "",
              issuedBy: individual.passportDetails.issuedBy || "",
              issuedDate: individual.passportDetails.issuedDate
                ? new Date(individual.passportDetails.issuedDate)
                    .toISOString()
                    .split("T")[0]
                : "",
            }
          : null,
      };
    } else if (client.clientType === ClientType.COMPANY && company) {
      formData = {
        id: client.id,
        workspaceId: client.workspaceId,
        clientType: "company",
        companyName: company.name,
        taxId: company.taxId,
        email: client.email,
        phone: client.phone,
        address: client.address,
        note: client.note,
      };
    } else {
      return { success: false, error: "Некоректний тип клієнта або дані відсутні" };
    }

    return { success: true, data: formData };
  } catch (error) {
    console.error("Get client details error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Помилка отримання даних",
    };
  }
}
