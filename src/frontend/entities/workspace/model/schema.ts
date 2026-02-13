import { z } from "zod";

/**
 * Базові схеми для примітивів
 */
const UUIDSchema = z.uuid();
const SlugSchema = z.string().min(2).max(50);
const NameSchema = z.string().min(2).max(100).trim();

/**
 * Схема воркспейсу для відображення в списках та навігації.
 * Це те, що ми називаємо "Light" або "Preview" моделлю.
 */
export const WorkspaceSchema = z.object({
  id: UUIDSchema,
  name: NameSchema,
  slug: SlugSchema,
});

/**
 * Схема для форми створення воркспейсу.
 * Тільки те, що вводить користувач.
 */
export const CreateWorkspaceSchema = z.object({
  name: NameSchema,
});

/**
 * Схема налаштувань (на майбутнє).
 * Поки що не включаємо її в основний WorkspaceSchema,
 * щоб не ускладнювати типи там, де це не потрібно.
 */
export const WorkspaceSettingsSchema = z.object({
  visibilityMode: z.enum(["all", "team", "own"]).default("all"),
  defaultCurrency: z.string().default("UAH"),
  timezone: z.string().default("Europe/Kyiv"),
  dateFormat: z.string().default("DD.MM.YYYY"),
});
