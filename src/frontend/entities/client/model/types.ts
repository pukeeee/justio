import { z } from "zod";
import { clientSchema, createClientSchema, updateClientSchema } from "./schema";

/**
 * Тип повного контакту, отриманий зі схеми
 */
export type Client = z.infer<typeof clientSchema>;

/**
 * Тип для створення нового контакту
 */
export type CreateClient = z.infer<typeof createClientSchema>;

/**
 * Тип для оновлення контакту
 */
export type UpdateClient = z.infer<typeof updateClientSchema>;

/**
 * Допоміжні типи для конкретних видів контактів
 */
export type IndividualContact = Extract<Client, { clientType: "individual" }>;
export type CompanyContact = Extract<Client, { clientType: "company" }>;

/**
 * Типи для вибору (select/radio) у UI
 */
export type ClientType = Client["clientType"];
