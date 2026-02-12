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
 * Запит на видалення воркспейсу
 */
export interface DeleteWorkspaceRequest {
  id: string;
}
