"use server";

import { container } from "@/backend/infrastructure/di/container";
import { GetClientsListUseCase } from "@/backend/application/use-cases/clients/get-clients-list.use-case";
import { IAuthService } from "@/backend/application/interfaces/services/auth.service.interface";
import { Client, ClientType } from "@/frontend/entities/client/model/types";
import { ClientListItemDTO } from "@/backend/application/dtos/clients/client-list-item.dto";

/**
 * @description Отримує список контактів для поточного воркспейсу.
 */
export async function getClientsAction(
  workspaceId: string,
): Promise<{ clients: Client[]; error: string | null }> {
  try {
    const getClientsListUseCase = container.resolve(GetClientsListUseCase);
    const authService = container.resolve<IAuthService>("IAuthService");

    const user = await authService.getCurrentUser();
    if (!user) {
      return { clients: [], error: "Необхідна авторизація" };
    }

    // Виклик Use Case: передаємо workspaceId та порожні опції
    const result = await getClientsListUseCase.execute(workspaceId, {});

    // Мапінг даних з бекенд DTO на фронтенд сутності
    const mappedClients: Client[] = result.items.map(
      (item: ClientListItemDTO) => {
        const type = item.clientType as ClientType;

        const base = {
          id: item.id,
          workspaceId: workspaceId,
          email: item.email || null,
          phone: item.phone || null,
          address: null,
          note: null,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.createdAt),
        };

        if (type === "individual") {
          return {
            ...base,
            clientType: "individual",
            firstName: item.firstName || "",
            lastName: item.lastName || "",
            isFop: item.isFop ?? false,
            taxNumber: item.taxNumber || null,
          } satisfies Client;
        } else {
          return {
            ...base,
            clientType: "company",
            companyName: item.companyName || item.displayName,
            taxId: item.taxId || null,
          } satisfies Client;
        }
      },
    );

    return { clients: mappedClients, error: null };
  } catch (error) {
    console.error("Get clients action error:", error);
    return {
      clients: [],
      error:
        error instanceof Error
          ? error.message
          : "Не вдалося завантажити клієнтів",
    };
  }
}
