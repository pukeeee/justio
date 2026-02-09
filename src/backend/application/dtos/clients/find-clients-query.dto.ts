/**
 * Параметри для пошуку та фільтрації клієнтів.
 * Використовується в репозиторіях та Use Cases.
 */
export interface FindAllClientsOptions {
  limit?: number;
  offset?: number;
  search?: string;
  onlyDeleted?: boolean;
}
