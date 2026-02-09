import { z } from "zod";

/** @description Схема паспортних даних */
export const passportDetailsSchema = z.object({
  series: z.string().optional().or(z.literal("")),
  number: z.string().min(1, "Номер паспорта обов'язковий").or(z.literal("")),
  issuedBy: z.string().optional().or(z.literal("")),
  issuedDate: z.string().optional().or(z.literal("")),
});

/** @description Спільні поля для обох типів контактів */
const clientBaseSchema = z.object({
  id: z.uuid().optional(),
  workspaceId: z.uuid(),
  email: z
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
  address: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/** @description Схема для фізичної особи */
const individualSchema = clientBaseSchema.extend({
  clientType: z.literal("individual"),
  firstName: z.string().min(1, "Ім'я обов'язкове"),
  lastName: z.string().min(1, "Прізвище обов'язкове"),
  middleName: z.string().nullable().optional(),
  dateOfBirth: z.union([z.date(), z.string()]).nullable().optional(),
  isFop: z.boolean(),
  taxNumber: z
    .string()
    .length(10, "РНОКПП має містити 10 цифр")
    .regex(/^\d+$/, "Тільки цифри")
    .nullable()
    .optional()
    .or(z.literal("")),
  passportDetails: passportDetailsSchema.nullable().optional(),
});

/** @description Схема для компанії (юридичної особи) */
const companySchema = clientBaseSchema.extend({
  clientType: z.literal("company"),
  companyName: z.string().min(1, "Назва компанії обов'язкова"),
  taxId: z
    .string()
    .min(8, "ЄДРПОУ має містити 8 або 12 цифр")
    .max(12)
    .regex(/^\d+$/, "Тільки цифри")
    .nullable()
    .optional()
    .or(z.literal("")),
});

/** @description Об'єднана схема клієнта (Discriminated Union) */
export const clientSchema = z.discriminatedUnion("clientType", [
  individualSchema,
  companySchema,
]);

/** @description Схема для створення клієнта (без метаданих) */
const createBaseSchema = clientBaseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const createClientSchema = z.discriminatedUnion("clientType", [
  createBaseSchema.extend({
    clientType: z.literal("individual"),
    firstName: z.string().min(1, "Ім'я обов'язкове"),
    lastName: z.string().min(1, "Прізвище обов'язкове"),
    middleName: z.string().nullable().optional(),
    dateOfBirth: z.union([z.date(), z.string()]).nullable().optional(),
    isFop: z.boolean(),
    taxNumber: z
      .string()
      .length(10, "РНОКПП має містити 10 цифр")
      .regex(/^\d+$/, "Тільки цифри")
      .nullable()
      .optional()
      .or(z.literal("")),
    passportDetails: passportDetailsSchema.nullable().optional(),
  }),
  createBaseSchema.extend({
    clientType: z.literal("company"),
    companyName: z.string().min(1, "Назва компанії обов'язкова"),
    taxId: z
      .string()
      .min(8, "ЄДРПОУ має містити 8 або 12 цифр")
      .max(12)
      .regex(/^\d+$/, "Тільки цифри")
      .nullable()
      .optional()
      .or(z.literal("")),
  }),
]);
