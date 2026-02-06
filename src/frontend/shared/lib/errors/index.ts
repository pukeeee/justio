/**
 * @file Утиліти для обробки помилок.
 * @description Цей модуль надає стандартизовані класи, коди та обробники помилок
 * для всього додатку, забезпечуючи консистентність відповідей API та логування.
 */

import { type ApiErrorResponse } from "@/frontend/shared/lib/validations/schemas";
import { ZodError } from "zod";

// ============================================================================
// КОДИ ПОМИЛОК
// ============================================================================

/**
 * @description Стандартизовані коди помилок для API.
 * Використовуються для програмної ідентифікації типу помилки на клієнті.
 */
export const ERROR_CODES = {
  // Помилки автентифікації та доступу (4xx)
  UNAUTHORIZED: "unauthorized", // Необхідна автентифікація
  FORBIDDEN: "forbidden", // Доступ заборонено
  INVALID_CREDENTIALS: "invalid_credentials", // Неправильні дані для входу
  SESSION_EXPIRED: "session_expired", // Сесія застаріла

  // Помилки валідації (4xx)
  VALIDATION_ERROR: "validation_error", // Загальна помилка валідації
  INVALID_INPUT: "invalid_input", // Некоректні вхідні дані

  // Помилки, пов'язані з ресурсами (4xx)
  NOT_FOUND: "not_found", // Ресурс не знайдено
  ALREADY_EXISTS: "already_exists", // Ресурс вже існує
  CONFLICT: "conflict", // Конфлікт стану ресурсу

  // Помилки, пов'язані з квотами та лімітами (4xx)
  QUOTA_EXCEEDED: "quota_exceeded", // Перевищено квоту
  RATE_LIMIT_EXCEEDED: "rate_limit_exceeded", // Перевищено ліміт запитів

  // Помилки, пов'язані з платежами (4xx)
  PAYMENT_REQUIRED: "payment_required", // Необхідна оплата
  PAYMENT_FAILED: "payment_failed", // Помилка платежу

  // Внутрішні помилки сервера (5xx)
  INTERNAL_ERROR: "internal_error", // Загальна внутрішня помилка
  SERVICE_UNAVAILABLE: "service_unavailable", // Сервіс тимчасово недоступний
} as const;

/**
 * @description Тип, що представляє один із можливих кодів помилок.
 */
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// ============================================================================
// КЛАСИ ПОМИЛОК
// ============================================================================

type AppErrorOptions = {
  cause?: unknown;
};

/**
 * @description Базовий клас для всіх кастомних помилок у додатку.
 * Дозволяє додавати до помилки HTTP статус-код, стандартизований код помилки та першопричину.
 */
export class AppError extends Error {
  public readonly cause?: unknown;

  constructor(
    public message: string,
    public code: ErrorCode,
    public statusCode: number = 500,
    options?: AppErrorOptions,
  ) {
    super(message);
    this.name = this.constructor.name; // Більш динамічне ім'я
    this.cause = options?.cause;
  }
}

/**
 * @description Помилка валідації (400).
 * Може містити деталізовану інформацію про помилки для кожного поля.
 * @property {Record<string, string[]>} [details] - Об'єкт, де ключ - це назва поля,
 * а значення - масив рядків з помилками валідації для цього поля.
 */
export class ValidationError extends AppError {
  public details?: Record<string, string[]>;

  constructor(
    message: string,
    details?: Record<string, string[]>,
    options?: AppErrorOptions,
  ) {
    super(message, ERROR_CODES.VALIDATION_ERROR, 400, options);
    this.details = details;
  }
}

/**
 * @description Помилка "Не авторизовано" (401).
 * Виникає, коли для доступу до ресурсу потрібна автентифікація.
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Не авторизовано", options?: AppErrorOptions) {
    super(message, ERROR_CODES.UNAUTHORIZED, 401, options);
  }
}

/**
 * @description Помилка "Доступ заборонено" (403).
 * Виникає, коли автентифікований користувач не має прав для виконання дії.
 */
export class ForbiddenError extends AppError {
  constructor(
    message: string = "Доступ заборонено",
    options?: AppErrorOptions,
  ) {
    super(message, ERROR_CODES.FORBIDDEN, 403, options);
  }
}

/**
 * @description Помилка "Не знайдено" (404).
 * Виникає, коли запитаний ресурс не існує.
 */
export class NotFoundError extends AppError {
  constructor(
    message: string = "Ресурс не знайдено",
    options?: AppErrorOptions,
  ) {
    super(message, ERROR_CODES.NOT_FOUND, 404, options);
  }
}

/**
 * @description Помилка "Конфлікт" (409).
 * Виникає при конфлікті стану, наприклад, спробі створити ресурс, що вже існує.
 */
export class ConflictError extends AppError {
  constructor(
    message: string = "Конфлікт стану ресурсу",
    options?: AppErrorOptions,
  ) {
    super(message, ERROR_CODES.CONFLICT, 409, options);
  }
}

/**
 * @description Помилка "Перевищено квоту" (403).
 * Виникає, коли користувач вичерпав свій ліміт на певну дію.
 */
export class QuotaExceededError extends AppError {
  constructor(message: string, options?: AppErrorOptions) {
    super(message, ERROR_CODES.QUOTA_EXCEEDED, 403, options);
  }
}

/**
 * @description Помилка "Перевищено ліміт запитів" (429).
 */
export class RateLimitError extends AppError {
  constructor(
    message: string = "Перевищено ліміт запитів",
    options?: AppErrorOptions,
  ) {
    super(message, ERROR_CODES.RATE_LIMIT_EXCEEDED, 429, options);
  }
}

/**
 * @description Помилка, пов'язана з оплатою (402).
 */
export class PaymentError extends AppError {
  constructor(message: string, options?: AppErrorOptions) {
    super(message, ERROR_CODES.PAYMENT_FAILED, 402, options);
  }
}

/**
 * @description Внутрішня помилка сервера (500).
 * Використовується для обгортання непередбачуваних системних помилок.
 */
export class InternalServerError extends AppError {
  constructor(
    message: string = "Внутрішня помилка сервера",
    options?: AppErrorOptions,
  ) {
    super(message, ERROR_CODES.INTERNAL_ERROR, 500, options);
  }
}

// ============================================================================
// ФАБРИКИ ПОМИЛОК
// ============================================================================

/**
 * @description Створює екземпляр ValidationError з помилки Zod.
 * @param {ZodError} error - Помилка валідації від Zod.
 * @returns {ValidationError} - Екземпляр кастомної помилки валідації.
 */
function createValidationErrorFromZod(error: ZodError): ValidationError {
  const details: Record<string, string[]> = {};
  let formError: string | null = null;

  error.issues.forEach((issue) => {
    // Помилка, не прив'язана до конкретного поля (напр. в `refine`), вважається глобальною.
    if (issue.path.length === 0) {
      if (!formError) formError = issue.message;
    } else {
      // Помилка, прив'язана до поля, додається в `details`.
      const fieldName = issue.path.join(".");
      if (!details[fieldName]) {
        details[fieldName] = [];
      }
      details[fieldName].push(issue.message);
    }
  });

  // Основне повідомлення — це глобальна помилка, якщо вона є, інакше — перша з помилок полів.
  const firstErrorMessage =
    formError ?? error.issues[0]?.message ?? "Помилка валідації";

  return new ValidationError(firstErrorMessage, details, { cause: error });
}

// ============================================================================
// ОБРОБНИКИ ПОМИЛОК
// ============================================================================

/**
 * @description Перетворює будь-яку помилку на стандартизований об'єкт відповіді API.
 * Автоматично логує всі непередбачувані та серверні помилки.
 * @param {unknown} error - Перехоплена помилка.
 * @returns {ApiErrorResponse} - Стандартизований об'єкт помилки для відповіді клієнту.
 */
export function handleError(error: unknown): ApiErrorResponse {
  // Спочатку обробляємо помилки Zod, оскільки це найпоширеніший випадок валідації.
  if (error instanceof ZodError) {
    const validationError = createValidationErrorFromZod(error);
    // Помилки валідації не є непередбачуваними, тому ми не логуємо їх як серверні помилки.
    return {
      success: false,
      error: validationError.message,
      code: validationError.code,
      details: validationError.details,
    };
  }

  // Якщо помилка не є екземпляром AppError, це непередбачувана ситуація.
  // Обгортаємо її в `InternalServerError`, щоб зберегти `cause` і стандартизувати відповідь.
  if (!(error instanceof AppError)) {
    const unknownError = new InternalServerError(
      "Внутрішня помилка сервера. Будь ласка, спробуйте пізніше.",
      { cause: error },
    );
    // Логуємо непередбачувані помилки для подальшого аналізу.
    logError(unknownError);
    return {
      success: false,
      error: unknownError.message,
      code: unknownError.code,
    };
  }

  // На цьому етапі ми маємо справу тільки з екземплярами AppError.
  // Автоматично логуємо всі серверні помилки (5xx), оскільки вони вказують на проблеми на бекенді.
  if (error.statusCode >= 500) {
    logError(error);
  }

  // Формуємо стандартну відповідь про помилку.
  const response: ApiErrorResponse = {
    success: false,
    error: error.message,
    code: error.code,
  };

  // Якщо це помилка валідації (наш кастомний ValidationError), додаємо деталі для полів.
  if (error instanceof ValidationError && error.details) {
    response.details = error.details;
  }

  return response;
}

/**
 * @description Отримує HTTP статус-код з помилки.
 * @param {unknown} error - Перехоплена помилка.
 * @returns {number} - HTTP статус-код.
 */
export function getErrorStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }

  if (error instanceof ZodError) {
    return 400; // Bad Request
  }

  return 500; // Internal Server Error
}

// ============================================================================
// ЛОГУВАННЯ
// ============================================================================

/**
 * @description Логує помилку з додатковим контекстом.
 * @param {unknown} error - Помилка для логування.
 * @param {Record<string, unknown>} [context] - Додатковий контекст у форматі ключ-значення.
 *
 * @todo Інтегрувати з повноцінним сервісом логування (Sentry, LogRocket, тощо).
 */
export function logError(error: unknown, context?: Record<string, unknown>) {
  const isAppError = error instanceof AppError;
  const originalError = isAppError ? error : undefined;
  // Визначаємо першопричину: для `AppError` це властивість `cause`, для інших — сама помилка.
  const cause = isAppError ? error.cause : error;

  const logEntry = {
    message: originalError?.message ?? String(cause),
    name: originalError?.name ?? "UnknownError",
    code: originalError?.code,
    statusCode: originalError?.statusCode,
    stack: originalError?.stack,
    // Логуємо `cause` для повного розуміння ланцюжка помилок.
    cause:
      cause instanceof Error
        ? { message: cause.message, stack: cause.stack }
        : String(cause),
    context,
    timestamp: new Date().toISOString(),
  };

  // Використовуємо `console.error` для виводу в потік помилок,
  // що є стандартною практикою для систем логування.
  console.error("Помилка:", JSON.stringify(logEntry, null, 2));

  // TODO: Надіслати помилку до сервісу моніторингу в продакшн-середовищі
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { extra: context });
  // }
}

/**
 * @description Логує попередження.
 * @param {string} message - Повідомлення для логування.
 * @param {Record<string, unknown>} [context] - Додатковий контекст.
 */
export function logWarning(message: string, context?: Record<string, unknown>) {
  console.warn("Попередження:", {
    message,
    context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * @description Логує інформаційне повідомлення (тільки в режимі розробки).
 * @param {string} message - Повідомлення для логування.
 * @param {Record<string, unknown>} [context] - Додатковий контекст.
 */
export function logInfo(message: string, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") {
    console.log("Інфо:", {
      message,
      context,
      timestamp: new Date().toISOString(),
    });
  }
}
