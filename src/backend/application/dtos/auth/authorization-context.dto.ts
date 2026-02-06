import { Role } from "@/backend/domain/value-objects/role.vo";

/**
 * Контекст авторизації - вся необхідна інформація для перевірки прав.
 */
export interface AuthorizationContext {
  userId: string;
  workspaceId: string;
  role: Role;
}
