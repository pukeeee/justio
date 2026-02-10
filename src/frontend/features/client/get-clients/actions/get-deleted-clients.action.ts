"use server";

import { container } from "@/backend/infrastructure/di/container";
import { GetClientsListUseCase } from "@/backend/application/use-cases/clients/get-clients-list.use-case";
import { getUserWorkspaces } from "@/frontend/shared/lib/auth/get-user-data";
import { Client, ClientType } from "@/frontend/entities/client/model/types";
import { ClientListItemDTO } from "@/backend/application/dtos/clients/client-list-item.dto";

/**
 * Server Action для отримання списку видалених клієнтів.
 */
export async function getDeletedClientsAction(
  workspaceId: string,
): Promise<{ clients: Client[]; error: string | null }> {
  try {
    const getClientsListUseCase = container.resolve(GetClientsListUseCase);

    // Отримуємо тільки видалені клієнти
    const result = await getClientsListUseCase.execute(workspaceId, {
      onlyDeleted: true,
      limit: 100, // Для кошика поки беремо без пагінації перші 100
    });

    const mappedClients: Client[] = result.items.map(
      (item: ClientListItemDTO) => {
        const type = item.clientType as ClientType;

        const base = {
          id: item.id,
          workspaceId: workspaceId,
          email: item.email || "",
          phone: item.phone || "",
          createdAt: item.createdAt,
        };

        if (type === "individual") {
          const names = item.displayName.split(" ");
          return {
            ...base,
            clientType: "individual",
            firstName: names[1] || "",
            lastName: names[0] || "",
            isFop: item.isFop || false,
            taxNumber: item.taxNumber || "",
          } satisfies Client;
        }

        return {
          ...base,
          clientType: "company",
          companyName: item.displayName,
          taxId: item.taxId || "",
        } satisfies Client;
      },
    );

    return { clients: mappedClients, error: null };
  } catch (error: unknown) {
    console.error("Get deleted clients action error:", error);
    return {
      clients: [],
      error: error instanceof Error ? error.message : "Помилка при отриманні кошика",
    };
  }
}
