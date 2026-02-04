import type { ContactListItemDTO } from './contact-list-item.dto';

/**
 * DTO відповіді для отримання списку контактів.
 * Містить масив елементів та загальну кількість для пагінації.
 */
export interface GetContactsListResponse {
  /** Список контактів */
  items: ContactListItemDTO[];
  /** Загальна кількість контактів у базі за заданими фільтрами */
  total: number;
}
