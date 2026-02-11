import type { ClientListItemDTO } from "./client-list-item.dto";

/**
 * DTO відповіді для отримання списку клієнтів.
 * Містить масив елементів та загальну кількість для пагінації.
 */
export interface GetClientsListResponse {
  /** Список клієнтів */
  items: ClientListItemDTO[];
  /** Загальна кількість контактів у базі за заданими фільтрами */
  total: number;
}
