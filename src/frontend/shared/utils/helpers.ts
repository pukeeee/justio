import type { WorkspaceInvitation } from "../lib/validations/schemas";
import { DEFAULT_INVITATION_EXPIRY_DAYS } from "../../../shared/config/billing";

/**
 * Перевіряє, чи може сутність бути додана згідно з лімітами.
 * @param quota - Об'єкт з поточним та максимальним значенням.
 * @returns boolean
 */
export function canAddEntity(quota: { current: number; max: number }): boolean {
  if (quota.max === Infinity) return true;
  return quota.current < quota.max;
}

/**
 * Перевіряє, чи запрошення ще дійсне (статус 'pending' і не прострочене).
 * @param invitation - Об'єкт запрошення, що містить статус та термін дії.
 * @returns boolean
 */
export function isInvitationValid(
  invitation: Pick<WorkspaceInvitation, "status" | "expires_at">,
): boolean {
  if (invitation.status !== "pending") return false;
  return new Date(invitation.expires_at) > new Date();
}

/**
 * Генерує дату закінчення терміну дії запрошення.
 * @param days - Кількість днів, через які запрошення стане недійсним.
 * @returns Date
 */
export function getInvitationExpiryDate(
  days: number = DEFAULT_INVITATION_EXPIRY_DAYS,
): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}
