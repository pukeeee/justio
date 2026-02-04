/**
 * Статуси користувача в системі.
 */
export enum UserStatus {
  /** Активний користувач (має доступ до системи) */
  ACTIVE = 'active',
  /** Тимчасово заблокований */
  SUSPENDED = 'suspended',
  /** Видалений (логічне видалення) */
  DELETED = 'deleted'
}
