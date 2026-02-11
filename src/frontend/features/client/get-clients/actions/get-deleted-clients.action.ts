"use server";

import { container } from "@/backend/infrastructure/di/container";
import { GetClientsListUseCase } from "@/backend/application/use-cases/clients/get-clients-list.use-case";
import { Client } from "@/frontend/entities/client/model/types";
import { ClientListItemDTO } from "@/backend/application/dtos/clients/client-list-item.dto";
import { clientSchema } from "@/frontend/entities/client/model/schema";

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

    const clients: Client[] = [];
    const errors: string[] = [];

    result.items.forEach((item: ClientListItemDTO) => {
      // Підготовка даних для Zod-схеми
      const rawData = {
        ...item,
        workspaceId,
        // Переконуємося, що типи відповідають схемі (Zod Discrimination Union)
        clientType: item.clientType === "company" ? "company" : "individual",
      };

      const validation = clientSchema.safeParse(rawData);

      if (validation.success) {
        clients.push(validation.data as Client);
      } else {
        console.error(`Validation error for client ${item.id}:`, validation.error.format());
        errors.push(`Клієнт ${item.id} має некоректні дані`);
      }
    });

    return { 
      clients, 
      error: errors.length > 0 ? "Деякі дані в кошику застаріли або пошкоджені" : null 
    };
  } catch (error: unknown) {
    console.error("Get deleted clients action error:", error);
    return {
      clients: [],
      error: error instanceof Error ? error.message : "Помилка при отриманні кошика",
    };
  }
}
