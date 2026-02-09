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
        // Явне приведення типу замість any, оскільки значення enum збігаються з нашими стрінговими літералами
        const type = item.clientType as ClientType;

        const base = {
          id: item.id,
          workspaceId: workspaceId,
          clientType: type,
          email: item.email,
          phone: item.phone,
          address: null,
          note: null,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.createdAt),
        };

        if (type === "individual") {
          const nameParts = item.displayName.split(" ");
          return {
            ...base,
            clientType: "individual",
            firstName: nameParts[1] || "",
            lastName: nameParts[0] || "",
            isFop: item.isFop ?? false,
            taxNumber: item.taxNumber,
          } satisfies Client;
        } else {
          return {
            ...base,
            clientType: "company",
            companyName: item.displayName,
            taxId: item.taxId,
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
