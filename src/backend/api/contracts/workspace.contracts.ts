import { z } from "zod";

/**
 * Базові схеми для примітивів
 */
const NameSchema = z
  .string()
  .min(2, "Назва занадто коротка")
  .max(100, "Назва занадто довга")
  .trim();

// --- Create Workspace ---

/**
 * Схема запиту на створення воркспейсу
 */
export const CreateWorkspaceRequestSchema = z.object({
  name: NameSchema,
});

/**
 * Тип запиту на створення воркспейсу
 */
export type CreateWorkspaceRequest = z.infer<
  typeof CreateWorkspaceRequestSchema
>;

/**
 * Відповідь при створенні воркспейсу
 */
export interface CreateWorkspaceResponse {
  id: string;
  name: string;
  slug: string;
  createdAt: string; // ISO 8601
}

// --- Get Workspaces ---

/**
 * Запит на отримання списку воркспейсів
 * (параметри не потрібні, бо беремо для поточного юзера)
 * Використовуємо Record<string, never> замість порожнього інтерфейсу для позначення порожнього об'єкта
 */
export type GetWorkspacesRequest = Record<string, never>;

/**
 * Елемент списку воркспейсів
 */
export interface WorkspaceListItem {
  id: string;
  name: string;
  slug: string;
  role: "owner" | "admin" | "manager" | "user";
}

/**
 * Відповідь зі списком воркспейсів
 */
export interface GetWorkspacesResponse {
  items: WorkspaceListItem[];
}

// --- Delete Workspace ---

/**
 * Запит на видалення воркспейсу (м'яке або повне)
 */
export const DeleteWorkspaceRequestSchema = z.object({
  id: z.uuid("Некоректний ID воркспейсу"),
});

/**
 * Тип запиту на видалення воркспейсу
 */
export type DeleteWorkspaceRequest = z.infer<
  typeof DeleteWorkspaceRequestSchema
>;

/**
 * Схема запиту на повне видалення воркспейсу
 */
export const HardDeleteWorkspaceRequestSchema = z.object({
  id: z.uuid("Некоректний ID воркспейсу"),
});

/**
 * Тип запиту на повне видалення воркспейсу
 */
export type HardDeleteWorkspaceRequest = z.infer<
  typeof HardDeleteWorkspaceRequestSchema
>;
