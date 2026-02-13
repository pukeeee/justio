import { z } from "zod";
import {
  WorkspaceSchema,
  CreateWorkspaceSchema,
  WorkspaceSettingsSchema,
} from "./schema";

/**
 * Основний тип воркспейсу (DTO для списків та навігації).
 * Містить тільки id, name та slug.
 */
export type Workspace = z.infer<typeof WorkspaceSchema>;

/**
 * Тип для створення воркспейсу (тільки name).
 */
export type CreateWorkspace = z.infer<typeof CreateWorkspaceSchema>;

/**
 * Тип налаштувань (для майбутнього використання в налаштуваннях дашборду).
 */
export type WorkspaceSettings = z.infer<typeof WorkspaceSettingsSchema>;
