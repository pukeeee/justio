/**
 * Сервіс для перевірки використання квот робочого простору.
 * Містить бізнес-логіку, пов'язану з квотами.
 */

import * as quotaRepository from "@/shared/repositories/quota.repository";
import { canAddEntity as canAddEntityHelper } from "@/frontend/shared/utils/helpers";
import type { QuotaEntity } from "@/shared/config/billing";

/**
 * Перевіряє, чи може воркспейс створити нову сутність (контакт, угоду, користувача)
 * згідно з лімітами тарифного плану.
 * @param workspaceId - ID робочого простору.
 * @param entityType - Тип сутності для перевірки.
 * @returns `true`, якщо можна створити, інакше `false`.
 */
export async function canCreateEntity(
  workspaceId: string,
  entityType: QuotaEntity,
): Promise<boolean> {
  try {
    const quota = await quotaRepository.getQuotasByWorkspaceId(workspaceId);

    // Якщо запису про квоти немає, надійніше заблокувати створення, щоб уникнути зловживань.
    if (!quota) {
      console.warn(
        `No quota record found for workspace ${workspaceId}. Denying creation.`,
      );
      return false;
    }

    let usage: { current: number; max: number };

    switch (entityType) {
      case "contacts":
        usage = { current: quota.current_contacts, max: quota.max_contacts };
        break;
      case "deals":
        usage = { current: quota.current_deals, max: quota.max_deals };
        break;
      case "users":
        usage = { current: quota.current_users, max: quota.max_users };
        break;
      default:
        // Цей кейс ніколи не має спрацювати через типізацію, але це гарна практика "захисного програмування".
        console.warn(`Unknown entity type for quota check: ${entityType}`);
        return false;
    }

    // Використовуємо наш універсальний хелпер для самої логіки перевірки
    return canAddEntityHelper(usage);
  } catch (error) {
    console.error(
      `Помилка під час перевірки квот для воркспейсу ${workspaceId}:`,
      error,
    );
    // При будь-якій помилці безпечніше заблокувати створення
    return false;
  }
}
