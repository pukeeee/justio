/**
 * Базовий формат відповіді API
 * Всі контролери повертають цей тип
 */
export interface ApiResponse<T = unknown> {
  /** Чи успішна операція */
  success: boolean;
  /** Дані при успіху */
  data?: T;
  /** Помилка при неуспіху */
  error?: ApiError;
}

/**
 * Стандартний формат помилки API
 */
export interface ApiError {
  /** Опис помилки для користувача */
  message: string;
  /** Код помилки для програмного обробления */
  code: ErrorCode;
  /** Помилки валідації полів форми */
  validationErrors?: Record<string, string>;
  /** Додаткові деталі для debug (тільки в dev) */
  details?: unknown;
}

/**
 * Стандартні коди помилок
 */
export enum ErrorCode {
  // Авторизація
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  
  // Валідація
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DUPLICATE_ENTITY = 'DUPLICATE_ENTITY',
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
  
  // Бізнес-логіка
  DOMAIN_ERROR = 'DOMAIN_ERROR',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  
  // Система
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

/**
 * Базовий request для операцій, що потребують авторизації
 */
export interface AuthenticatedRequest {
  /** ID користувача (заповнюється автоматично) */
  userId?: string;
  /** ID воркспейсу (якщо операція в контексті воркспейсу) */
  workspaceId?: string;
}

/**
 * Параметри пагінації
 */
export interface PaginationParams {
  /** Кількість записів на сторінку */
  limit?: number;
  /** Зсув від початку */
  offset?: number;
}

/**
 * Відповідь з пагінацією
 */
export interface PaginatedResponse<T> {
  /** Записи поточної сторінки */
  items: T[];
  /** Загальна кількість записів */
  total: number;
  /** Розмір сторінки */
  limit: number;
  /** Зсув */
  offset: number;
}
