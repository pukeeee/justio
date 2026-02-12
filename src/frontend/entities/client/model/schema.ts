import { z } from "zod";

/** @description Схема паспортних даних з умовною валідацією */
export const passportDetailsSchema = z
  .object({
    series: z.string().nullable().optional().or(z.literal("")),
    number: z.string().nullable().optional().or(z.literal("")),
    issuedBy: z.string().nullable().optional().or(z.literal("")),
    issuedDate: z
      .union([z.string(), z.date()])
      .nullable()
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const hasSeries = !!(data.series && data.series.length > 0);
    const hasNumber = !!(data.number && data.number.length > 0);
    const hasIssuedBy = !!(data.issuedBy && data.issuedBy.length > 0);
    const hasIssuedDate = !!(data.issuedDate && data.issuedDate !== "");

    const isAnyFieldFilled = hasSeries || hasNumber || hasIssuedBy || hasIssuedDate;

    if (isAnyFieldFilled) {
      if (!hasNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Номер паспорта обов'язковий",
          path: ["number"],
        });
      }
      if (!hasIssuedBy) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Поле 'Ким виданий' обов'язкове",
          path: ["issuedBy"],
        });
      }
      if (!hasIssuedDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Дата видачі обов'язкова",
          path: ["issuedDate"],
        });
      }
    }
  });

/** @description Спільні поля для обох типів контактів */
const clientBaseSchema = z.object({
  id: z.uuid().optional(),
  workspaceId: z.uuid(),
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
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/** @description Схема для фізичної особи */
const individualSchema = clientBaseSchema.extend({
  clientType: z.literal("individual"),
  firstName: z.string().min(1, "Ім'я обов'язкове"),
  lastName: z.string().min(1, "Прізвище обов'язкове"),
  middleName: z.string().nullable().optional().or(z.literal("")),
  dateOfBirth: z.union([z.date(), z.string()]).nullable().optional().or(z.literal("")),
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
    .length(8, "ЄДРПОУ має містити 8 цифр")
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
    middleName: z.string().nullable().optional().or(z.literal("")),
    dateOfBirth: z.union([z.date(), z.string()]).nullable().optional().or(z.literal("")),
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
      .length(8, "ЄДРПОУ має містити 8 цифр")
      .regex(/^\d+$/, "Тільки цифри")
      .nullable()
      .optional()
      .or(z.literal("")),
  }),
]);

/** @description Схема для оновлення клієнта */
export const updateClientSchema = z.discriminatedUnion("clientType", [
  createClientSchema.options[0].extend({ id: z.uuid() }),
  createClientSchema.options[1].extend({ id: z.uuid() }),
]);
