import { pgEnum } from "drizzle-orm/pg-core";

/**
 * Типи клієнтів: фізична або юридична особа.
 */
export const clientTypeEnum = pgEnum("client_type", ["individual", "company"]);

/**
 * Ролі користувача в workspace.
 */
export const workspaceRoleEnum = pgEnum("workspace_role", [
  "owner",
  "admin",
  "user",
]);

/**
 * Статус користувача в системі.
 */
export const userStatusEnum = pgEnum("user_status", [
  "active",
  "suspended",
  "deleted",
]);

/**
 * Статус користувача у воркспейсі.
 */
export const workspaceUserStatusEnum = pgEnum("workspace_user_status", [
  "active",
  "invited",
  "declined",
]);

/**
 * Рівні підписки воркспейсу.
 */
export const workspaceTierEnum = pgEnum("workspace_tier", [
  "free",
  "solo",
  "firm",
  "enterprise",
]);

/**
 * Ролі контактних осіб всередині компанії.
 */
export const companyContactRoleEnum = pgEnum("company_contact_role", [
  // Юридично значущі ролі
  "director", // Директор
  "founder", // Засновник
  "attorney", // Представник за довіреністю
  "head", // Керівник
  "acting_director", // Т.B.O. директора

  // Операційні ролі
  "contact_person", // Основна контактна особа
  "accountant", // Бухгалтер
  "lawyer", // Юрист
  "manager", // Менеджер

  "other", // Інше
]);
