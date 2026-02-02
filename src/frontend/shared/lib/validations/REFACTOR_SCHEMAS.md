# План рефакторингу файлу схем валідації (`schemas.ts`)

**Дата:** 5 січня 2026

## Мета

Поточний файл `src/shared/lib/validations/schemas.ts` містить всі Zod-схеми проекту. Він став занадто великим, що ускладнює його підтримку, навігацію та може призводити до конфліктів при паралельній розробці.

Мета цього рефакторингу — розбити єдиний файл на менші, логічно згруповані файли за доменами (сутностями), дотримуючись принципів високої зв'язності (High Cohesion) та методології Feature-Sliced Design.

## План дій

### Крок 1: Створення нової структури папок

1.  Створіть нову директорію для модульних схем:
    ```bash
    mkdir src/shared/lib/validations/schemas
    ```
2.  Старий файл `src/shared/lib/validations/schemas.ts` поки що **не видаляйте**. Він буде слугувати джерелом коду для нових файлів.

### Крок 2: Створення базового файлу `_common.schemas.ts`

Цей файл буде містити всі базові `enum`, примітивні типи, а також загальні схеми для API, які не належать до конкретної бізнес-сутності.

Створіть файл `src/shared/lib/validations/schemas/_common.schemas.ts` з наступним вмістом:

```typescript
import { z } from "zod";

// ============================================================================
// ENUMS
// ============================================================================

export const InvitationStatusSchema = z.enum([
  "pending",
  "accepted",
  "expired",
  "cancelled",
]);
export type InvitationStatus = z.infer<typeof InvitationStatusSchema>;

export const UserRoleSchema = z.enum([
  "owner",
  "admin",
  "manager",
  "user",
  "guest",
]);
export type UserRole = z.infer<typeof UserRoleSchema>;

// ... (скопіюйте сюди ВСІ інші Enum з оригінального файлу) ...

export const PaymentStatusSchema = z.enum([
  "pending",
  "completed",
  "failed",
  "refunded",
]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;


// ============================================================================
// BASE SCHEMAS (Common patterns)
// ============================================================================

export const UUIDSchema = z.uuid();
export const EmailSchema = z.email().min(5).max(255);
export const PhoneSchema = z
  .string()
  .regex(/^\+380\d{9}$/, "Невірний формат номера телефону");
export const URLSchema = z.url().optional();
export const SlugSchema = z
  .string()
  .regex(/^[a-z0-9-]+$/, "Slug може містити тільки малі літери, цифри та дефіс")
  .min(2)
  .max(50);

// ============================================================================
// API & PAGINATION
// ============================================================================

export const ApiSuccessResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
});

// ... (скопіюйте сюди решту загальних схем: Pagination, Filters, тощо) ...
```

### Крок 3: Створення файлів для кожної сутності

Тепер перенесіть відповідні схеми з оригінального `schemas.ts` в окремі файли всередині нової папки `schemas/`. Кожен файл повинен імпортувати `zod` та необхідні типи з `_common.schemas.ts`.

#### 1. `workspace.schemas.ts`
```typescript
import { z } from "zod";
import { UUIDSchema, SlugSchema, UserRoleSchema, WorkspaceUserStatusSchema } from "./_common.schemas";

// WorkspaceSettingsSchema, WorkspaceSchema, CreateWorkspaceSchema, etc.
// WorkspaceUserSchema, UpdateUserRoleSchema, etc.
// ... (все, що стосується воркспейсу та його користувачів)
```

#### 2. `invitation.schemas.ts`
```typescript
import { z } from "zod";
import { UUIDSchema, EmailSchema, UserRoleSchema, InvitationStatusSchema } from "./_common.schemas";

// WorkspaceInvitationSchema, CreateWorkspaceInvitationSchema, etc.
// ... (все, що стосується запрошень)
```

#### 3. `billing.schemas.ts`
```typescript
import { z } from "zod";
import { UUIDSchema, SubscriptionTierSchema, SubscriptionStatusSchema, PaymentStatusSchema } from "./_common.schemas";

// SubscriptionSchema, WorkspaceQuotaSchema, PaymentSchema
// ... (все, що стосується білінгу)
```

#### 4. `contact.schemas.ts`
```typescript
import { z } from "zod";
import { UUIDSchema, EmailSchema, PhoneSchema, URLSchema, ContactStatusSchema, CompanyStatusSchema } from "./_common.schemas";

// ContactSchema, CreateContactSchema, UpdateContactSchema
// CompanySchema, CreateCompanySchema, UpdateCompanySchema
// ... (все, що стосується контактів та компаній)
```

**... і так далі для решти сутностей (`deal`, `product`, `task` тощо).**

### Крок 4: Створення головного файлу-експортера (Barrel File)

Цей файл збирає всі експорти з окремих модулів і надає єдину точку входу для решти додатку.

Створіть файл `src/shared/lib/validations/schemas/index.ts` з таким вмістом:

```typescript
export * from "./_common.schemas";
export * from "./workspace.schemas";
export * from "./invitation.schemas";
export * from "./billing.schemas";
export * from "./contact.schemas";
export * from "./deal.schemas";
export * from "./product.schemas";
export * from "./task.schemas";
// ... додайте сюди експорти для всіх створених файлів
```

### Крок 5: Оновлення імпортів у проекті

Тепер потрібно знайти всі файли в проекті, де використовувався старий файл схем, і оновити шляхи імпорту.

**Знайти:**
`import { SomeSchema } from "@/shared/lib/validations/schemas";`

**Замінити на:**
`import { SomeSchema } from "@/shared/lib/validations/schemas";` (шлях не зміниться, але тепер він буде вказувати на новий `index.ts`, який є "бочкою").

Перевірте, чи всі імпорти працюють коректно. Можливо, доведеться перезапустити сервер розробки.

### Крок 6: Видалення старого файлу

Після того, як ви переконалися, що всі схеми перенесено, а всі імпорти в проекті оновлено і все працює, можна безпечно видалити старий файл:

```bash
rm src/shared/lib/validations/schemas.ts
```

Цей рефакторинг зробить вашу кодову базу значно чистішою та більш підготовленою до майбутнього розширення.
