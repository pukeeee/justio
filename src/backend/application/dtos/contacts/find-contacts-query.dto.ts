/**
 * Параметри для пошуку та фільтрації контактів.
 * Використовується в репозиторіях та Use Cases.
 */
export interface FindAllContactsOptions {
  limit?: number;
  offset?: number;
  search?: string;
  onlyDeleted?: boolean;
}
