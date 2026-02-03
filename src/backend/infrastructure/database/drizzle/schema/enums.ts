import { pgEnum } from "drizzle-orm/pg-core";

/**
 * Типи контактів: фізична або юридична особа.
 */
export const contactTypeEnum = pgEnum("contact_type", [
  "individual",
  "company",
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
