import { z } from "zod";
import type { PaginatedResponse } from "./base.contracts";

// --- Enums & Shared ---

/**
 * Тип клієнта: фізична особа або компанія
 */
export const ClientTypeEnum = z.enum(["individual", "company"]);
export type ClientType = z.infer<typeof ClientTypeEnum>;

/**
 * Схема паспортних даних з умовною валідацією
 */
export const PassportDetailsSchema = z
  .object({
    series: z.string().nullable().optional().or(z.literal("")),
    number: z.string().nullable().optional().or(z.literal("")),
    issuedBy: z.string().nullable().optional().or(z.literal("")),
    issuedDate: z
      .union([z.string(), z.date()])
      .nullable()
      .optional()
      .or(z.literal("")), // ISO string or Date from frontend form
  })
  .superRefine((data, ctx) => {
    const hasAnyValue =
      (data.series && data.series.length > 0) ||
      (data.number && data.number.length > 0) ||
      (data.issuedBy && data.issuedBy.length > 0) ||
      (data.issuedDate && data.issuedDate !== "");

    if (hasAnyValue) {
      if (!data.number || data.number.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Номер паспорта обов'язковий",
          path: ["number"],
        });
      }
      if (!data.issuedBy || data.issuedBy.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Поле 'Ким виданий' обов'язкове",
          path: ["issuedBy"],
        });
      }
      if (!data.issuedDate || data.issuedDate === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Дата видачі обов'язкова",
          path: ["issuedDate"],
        });
      }
    }
  });

export type PassportDetailsRequest = z.infer<typeof PassportDetailsSchema>;

// --- Base Fields ---

/**
 * Базові поля, спільні для всіх типів клієнтів
 */
const ClientBaseFields = {
  workspaceId: z.uuid("Некоректний ID воркспейсу"),
  email: z
    .string()
    .email("Некоректний формат email")
    .nullable()
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .nullable()
    .optional()
    .refine((val) => {
      if (!val || val === "") return true;
      const digits = val.replace(/\D/g, "");
      // Номер має містити 10 цифр (якщо введено як 067...) або 12 (якщо з 380...)
      return digits.length === 10 || digits.length === 12;
    }, "Введіть повний номер телефону (+380 XX XXX XX XX)")
    .or(z.literal("")),
  address: z.string().nullable().optional().or(z.literal("")),
  note: z.string().nullable().optional().or(z.literal("")),
};

// --- Create Client Request ---

/**
 * Схема для створення фізичної особи
 */
const CreateIndividualSchema = z.object({
  ...ClientBaseFields,
  clientType: z.literal("individual"),
  firstName: z.string().min(1, "Ім'я обов'язкове"),
  lastName: z.string().min(1, "Прізвище обов'язкове"),
  middleName: z.string().nullable().optional().or(z.literal("")),
  dateOfBirth: z.union([z.date(), z.string()]).nullable().optional().or(z.literal("")),
  isFop: z.boolean().default(false),
  taxNumber: z
    .string()
    .length(10, "РНОКПП має містити 10 цифр")
    .regex(/^\d+$/, "Тільки цифри")
    .nullable()
    .optional()
    .or(z.literal("")),
  passportDetails: PassportDetailsSchema.nullable().optional(),
  // Забороняємо поля компанії
  companyName: z.never().optional(),
  taxId: z.never().optional(),
});

/**
 * Схема для створення юридичної особи (компанії)
 */
const CreateCompanySchema = z.object({
  ...ClientBaseFields,
  clientType: z.literal("company"),
  companyName: z.string().min(1, "Назва компанії обов'язкова"),
  taxId: z
    .string()
    .length(8, "ЄДРПОУ має містити 8 цифр")
    .regex(/^\d+$/, "Тільки цифри")
    .nullable()
    .optional()
    .or(z.literal("")),
  // Забороняємо поля фізособи
  firstName: z.never().optional(),
  lastName: z.never().optional(),
});

/**
 * Об'єднана схема запиту на створення клієнта
 * Використовує discriminated union по полю clientType
 */
export const CreateClientRequestSchema = z.discriminatedUnion("clientType", [
  CreateIndividualSchema,
  CreateCompanySchema,
]);

/**
 * Тип запиту на створення клієнта (виводиться з Zod схеми)
 */
export type CreateClientRequest = z.infer<typeof CreateClientRequestSchema>;

// --- Update Client Request ---

/**
 * Схема запиту на оновлення клієнта
 * Розширює схему створення обов'язковим полем ID
 */
export const UpdateClientRequestSchema = z.discriminatedUnion("clientType", [
  CreateIndividualSchema.extend({ id: z.uuid() }),
  CreateCompanySchema.extend({ id: z.uuid() }),
]);

export type UpdateClientRequest = z.infer<typeof UpdateClientRequestSchema>;

// --- Responses ---

/**
 * Відповідь при успішному створенні клієнта
 */
export interface CreateClientResponse {
  id: string;
  workspaceId: string;
  clientType: ClientType;
  createdAt: string; // ISO 8601
}

/**
 * Відповідь при успішному оновленні клієнта
 */
export interface UpdateClientResponse {
  id: string;
  updatedAt: string; // ISO 8601
}

// --- Get List ---

/**
 * Схема параметрів запиту для отримання списку клієнтів
 */
export const GetClientsRequestSchema = z.object({
  workspaceId: z.uuid("Некоректний ID воркспейсу"),
  limit: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
  search: z.string().optional(),
  onlyDeleted: z.boolean().optional().default(false),
});

/**
 * Тип параметрів запиту для отримання списку клієнтів
 */
export type GetClientsRequest = z.infer<typeof GetClientsRequestSchema>;

/**
 * Елемент списку клієнтів (спрощена модель)
 */
export interface ClientListItem {
  id: string;
  workspaceId: string;
  clientType: ClientType;
  displayName: string;
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  email: string | null;
  phone: string | null;
  taxNumber?: string | null;
  taxId?: string | null;
  isFop?: boolean;
  createdAt: string;
}

/**
 * Відповідь зі списком клієнтів та пагінацією
 */
export type GetClientsResponse = PaginatedResponse<ClientListItem>;

// --- Get Details ---

/**
 * Схема запиту на отримання повної інформації про клієнта
 */
export const GetClientDetailsRequestSchema = z.object({
  id: z.uuid("Некоректний ID клієнта"),
  workspaceId: z.uuid("Некоректний ID воркспейсу"),
});

/**
 * Тип запиту на отримання повної інформації про клієнта
 */
export type GetClientDetailsRequest = z.infer<
  typeof GetClientDetailsRequestSchema
>;

/**
 * Базова структура деталей клієнта
 */
interface ClientDetailsBase {
  id: string;
  workspaceId: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Деталі фізичної особи
 */
export interface IndividualDetailsResponse extends ClientDetailsBase {
  clientType: "individual";
  firstName: string;
  lastName: string;
  middleName?: string | null;
  fullName?: string;
  dateOfBirth?: string | null;
  taxNumber?: string | null;
  isFop?: boolean;
  passportDetails?: {
    series?: string | null;
    number: string;
    issuedBy?: string | null;
    issuedDate?: string | null;
  } | null;
}

/**
 * Деталі компанії
 */
export interface CompanyDetailsResponse extends ClientDetailsBase {
  clientType: "company";
  companyName: string;
  taxId?: string | null;
}

/**
 * Повна детальна інформація про клієнта
 */
export type ClientDetailsResponse = IndividualDetailsResponse | CompanyDetailsResponse;

// --- Delete/Restore ---

/**
 * Схема запиту на м'яке видалення клієнта
 */
export const DeleteClientRequestSchema = z.object({
  id: z.uuid("Некоректний ID клієнта"),
  workspaceId: z.uuid("Некоректний ID воркспейсу"),
});

/**
 * Тип запиту на м'яке видалення клієнта
 */
export type DeleteClientRequest = z.infer<typeof DeleteClientRequestSchema>;

/**
 * Схема запиту на відновлення клієнта
 */
export const RestoreClientRequestSchema = z.object({
  id: z.uuid("Некоректний ID клієнта"),
  workspaceId: z.uuid("Некоректний ID воркспейсу"),
});

/**
 * Тип запиту на відновлення клієнта
 */
export type RestoreClientRequest = z.infer<typeof RestoreClientRequestSchema>;

/**
 * Схема запиту на повне (незворотнє) видалення клієнта
 */
export const HardDeleteClientRequestSchema = z.object({
  id: z.uuid("Некоректний ID клієнта"),
  workspaceId: z.uuid("Некоректний ID воркспейсу"),
});

/**
 * Тип запиту на повне (незворотнє) видалення клієнта
 */
export type HardDeleteClientRequest = z.infer<
  typeof HardDeleteClientRequestSchema
>;
