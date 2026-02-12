import { container } from "@/backend/infrastructure/di/container";
import { IAuthService } from "@/backend/application/interfaces/services/auth.service.interface";
import { IAuthorizationService } from "@/backend/application/interfaces/services/authorization.service.interface";
import { Permission } from "@/backend/domain/value-objects/permission.enum";
import { ApiResponse, ApiError, ErrorCode } from "../contracts/base.contracts";
import {
  ForbiddenError,
  UnauthorizedError,
} from "@/backend/domain/errors/authorization.errors";
import {
  DomainError,
  DuplicateEntityError,
  EntityNotFoundError,
} from "@/backend/domain/errors/invalid-data.error";
import {
  PermissionMetadata,
  PERMISSION_METADATA_KEY,
} from "../middleware/permission.guard";
import "reflect-metadata";
import { ZodError } from "zod";

/**
 * Базовий контролер з методами авторизації та обробки помилок
 *
 * Всі контролери наслідуються від цього класу щоб отримати:
 * - Автоматичну авторизацію
 * - Централізовану обробку помилок
 * - Стандартний формат відповідей
 */
export abstract class BaseController {
  protected authService: IAuthService;
  protected authorizationService: IAuthorizationService;

  constructor() {
    this.authService = container.resolve<IAuthService>("IAuthService");
    this.authorizationService = container.resolve<IAuthorizationService>(
      "IAuthorizationService",
    );
  }

  /**
   * Отримує поточного користувача або кидає помилку
   *
   * @throws UnauthorizedError якщо користувач не автентифікований
   */
  protected async getCurrentUserOrThrow() {
    const user = await this.authService.getCurrentUser();
    if (!user) {
      throw new UnauthorizedError("Користувач не автентифікований");
    }
    return user;
  }

  /**
   * Перевіряє права доступу на основі metadata декоратора @RequirePermissions
   *
   * @param method - Посилання на метод контролера (наприклад, this.create)
   * @param userId - ID користувача
   * @param workspaceId - ID воркспейсу
   */
  protected async checkMethodPermissions(
    method: (...args: never[]) => unknown,
    userId: string,
    workspaceId: string,
  ): Promise<void> {
    const metadata: PermissionMetadata | undefined = Reflect.getMetadata(
      PERMISSION_METADATA_KEY,
      method,
    );

    if (!metadata) {
      return; // Немає вимог до прав
    }

    const { permissions, requireAll } = metadata;

    if (requireAll) {
      // Всі права мають бути присутні
      for (const permission of permissions) {
        await this.ensurePermission(userId, permission, workspaceId);
      }
    } else {
      // Хоча б одне право
      const hasAny = await Promise.all(
        permissions.map((p) =>
          this.authorizationService.hasPermission(userId, p, workspaceId),
        ),
      ).then((results) => results.some(Boolean));

      if (!hasAny) {
        throw new ForbiddenError(
          `Потрібен хоча б один з дозволів: ${permissions.join(", ")}`,
        );
      }
    }
  }

  /**
   * Перевіряє наявність дозволу або кидає помилку
   *
   * @throws ForbiddenError якщо дозволу немає
   */
  protected async ensurePermission(
    userId: string,
    permission: Permission,
    workspaceId: string,
  ): Promise<void> {
    const hasPermission = await this.authorizationService.hasPermission(
      userId,
      permission,
      workspaceId,
    );

    if (!hasPermission) {
      throw new ForbiddenError(
        `Недостатньо прав: потрібен дозвіл ${permission}`,
      );
    }
  }

  /**
   * Обгортка для безпечного виконання операції з обробкою помилок
   *
   * Автоматично перехоплює помилки та маппить їх у стандартний формат ApiResponse
   */
  protected async execute<T>(
    operation: () => Promise<T>,
  ): Promise<ApiResponse<T>> {
    try {
      const data = await operation();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: this.mapErrorToApiError(error),
      };
    }
  }

  /**
   * Централізована обробка помилок
   *
   * Маппить доменні помилки в API формат з правильним кодом та повідомленням
   */
  private mapErrorToApiError(error: unknown): ApiError {
    // Логування для debugging
    console.error("[Controller Error]", error);

    // Помилки валідації Zod
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string> = {};

      const issues = error.issues || [];
      issues.forEach((err) => {
        const path = err.path.join(".");
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = err.message;
        }
      });

      return {
        message: "Помилка валідації даних",
        code: ErrorCode.VALIDATION_ERROR,
        validationErrors: fieldErrors,
      };
    }

    // Помилки авторизації
    if (error instanceof UnauthorizedError) {
      return {
        message: "Потрібна автентифікація",
        code: ErrorCode.UNAUTHORIZED,
      };
    }

    if (error instanceof ForbiddenError) {
      return {
        message: error.message || "Доступ заборонено",
        code: ErrorCode.FORBIDDEN,
      };
    }

    // Помилки валідації
    if (error instanceof DuplicateEntityError) {
      return {
        message: error.message,
        code: ErrorCode.DUPLICATE_ENTITY,
        validationErrors: error.fieldKey
          ? {
              [error.fieldKey]: error.message,
            }
          : undefined,
      };
    }

    if (error instanceof EntityNotFoundError) {
      return {
        message: error.message,
        code: ErrorCode.ENTITY_NOT_FOUND,
      };
    }

    // Інші доменні помилки
    if (error instanceof DomainError) {
      return {
        message: error.message,
        code: ErrorCode.DOMAIN_ERROR,
      };
    }

    // Невідома помилка
    return {
      message: "Внутрішня помилка сервера",
      code: ErrorCode.INTERNAL_ERROR,
      // В production не показуємо деталі
      details: process.env.NODE_ENV === "development" ? error : undefined,
    };
  }
}
