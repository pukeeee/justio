import { Permission } from "./permission.enum";

/**
 * Об'єкт-значення для Ролі користувача.
 * Визначає набір дозволів, які має користувач у робочому просторі.
 */
export class Role {
  static readonly OWNER = new Role("owner", new Set(Object.values(Permission)));

  static readonly ADMIN = new Role(
    "admin",
    new Set([
      Permission.CREATE_CONTACT,
      Permission.UPDATE_CONTACT,
      Permission.DELETE_CONTACT,
      Permission.VIEW_CONTACT,
      Permission.INVITE_USERS,
      Permission.REMOVE_USERS,
      // Admin не може керувати білінгом або видаляти workspace
    ]),
  );

  static readonly USER = new Role(
    "user",
    new Set([
      Permission.CREATE_CONTACT,
      Permission.UPDATE_CONTACT,
      Permission.VIEW_CONTACT,
      // User не може видаляти контакти
    ]),
  );

  private constructor(
    public readonly name: string,
    private readonly permissions: Set<Permission>,
  ) {}

  /**
   * Створює роль з назви. Повертає стандартну роль або кидає помилку.
   */
  static fromName(name: string): Role {
    switch (name) {
      case "owner":
        return Role.OWNER;
      case "admin":
        return Role.ADMIN;
      case "user":
        return Role.USER;
      default:
        throw new Error(`Unknown role: ${name}`);
    }
  }

  /**
   * Перевіряє, чи має роль певний дозвіл.
   */
  hasPermission(permission: Permission): boolean {
    return this.permissions.has(permission);
  }

  /**
   * Перевіряє рівність ролей.
   */
  equals(other: Role): boolean {
    return this.name === other.name;
  }
}
