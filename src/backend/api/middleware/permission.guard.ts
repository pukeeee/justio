import "reflect-metadata";
import { Permission } from "@/backend/domain/value-objects/permission.enum";

/**
 * Metadata key для зберігання вимог до прав доступу
 */
export const PERMISSION_METADATA_KEY = Symbol("permissions");

/**
 * Metadata для декоратора прав доступу
 */
export interface PermissionMetadata {
  /** Список необхідних прав */
  permissions: Permission[];
  /** true = потрібні всі права, false = хоча б одне */
  requireAll?: boolean;
}

/**
 * Decorator для вказання необхідних прав доступу на методі контролера
 *
 * @param permissions - Масив необхідних прав
 * @param requireAll - Чи потрібні всі права (true) або хоча б одне (false). Default: true.
 *
 * @example
 * @RequirePermissions([Permission.CREATE_CONTACT])
 * async create(request: CreateClientRequest) {
 *   // Метод виконається тільки якщо є права
 * }
 *
 * @example
 * @RequirePermissions([Permission.UPDATE_ANY_CONTACT, Permission.UPDATE_OWN_CONTACT], false)
 * async update(request: UpdateClientRequest) {
 *   // Метод виконається якщо є хоча б одне з прав
 * }
 */
export function RequirePermissions(
  permissions: Permission[],
  requireAll = true,
): MethodDecorator {
  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    const metadata: PermissionMetadata = { permissions, requireAll };

    // Зберігаємо metadata на методі
    Reflect.defineMetadata(PERMISSION_METADATA_KEY, metadata, descriptor.value);

    return descriptor;
  };
}

/**
 * Допоміжна функція для отримання metadata з методу
 */
export function getPermissionMetadata(
  method: (...args: never[]) => unknown,
): PermissionMetadata | undefined {
  return Reflect.getMetadata(PERMISSION_METADATA_KEY, method);
}
