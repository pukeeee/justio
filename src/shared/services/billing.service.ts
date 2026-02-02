/**
 * Сервіс для керування логікою білінгу, підписок та квот.
 * Реалізовано у функціональному стилі.
 * Цей сервіс відповідає за бізнес-логіку та оркестрацію,
 * делегуючи запити до БД відповідним репозиторіям.
 */

import type { Database } from "@/shared/types/database";
import type { SubscriptionTier } from "@/frontend/shared/lib/validations/schemas";
import { WORKSPACE_TIER_LIMITS } from "@/shared/config/billing";
import * as subscriptionRepository from "@/shared/repositories/subscription.repository";
import * as quotaRepository from "@/shared/repositories/quota.repository";

/**
 * Отримує дані про підписку для вказаного робочого простору.
 * @param workspaceId - ID робочого простору.
 * @returns Об'єкт підписки або null, якщо не знайдено.
 */
export async function getSubscriptionByWorkspaceId(
  workspaceId: string,
): Promise<Database["public"]["Tables"]["subscriptions"]["Row"] | null> {
  try {
    return await subscriptionRepository.getByWorkspaceId(workspaceId);
  } catch (error) {
    console.error("Помилка отримання підписки:", (error as Error).message);
    // Для запитів на читання безпечно повернути null, щоб не ламати UI
    return null;
  }
}

/**
 * Оновлює максимальні ліміти (квоти) для робочого простору відповідно
 * до його нового тарифного плану.
 * @param workspaceId - ID робочого простору.
 * @param tier - Новий тарифний план.
 */
export async function updateWorkspaceQuotas(
  workspaceId: string,
  tier: SubscriptionTier,
): Promise<void> {
  const limits = WORKSPACE_TIER_LIMITS[tier];
  if (!limits) {
    throw new Error(`Неправильний тарифний план: ${tier}`);
  }

  try {
    await quotaRepository.updateQuotas(workspaceId, {
      max_users: limits.users,
      max_contacts: limits.contacts,
      max_deals: limits.deals,
      max_storage_mb: limits.storage_mb,
    });
  } catch (error) {
    console.error(
      `Не вдалося оновити квоти для воркспейсу ${workspaceId}:`,
      (error as Error).message,
    );
    throw new Error("Не вдалося оновити квоти воркспейсу.");
  }
}

/**
 * Оновлює підписку воркспейсу до нового тарифного плану.
 * @param workspaceId - ID робочого простору.
 * @param newTier - Новий, вищий тарифний план.
 * @returns Об'єкт з результатом операції.
 */
export async function upgradeSubscription(
  workspaceId: string,
  newTier: SubscriptionTier,
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Оновлюємо саму підписку
    await subscriptionRepository.update(workspaceId, {
      tier: newTier,
      status: "active", // При апгрейді статус завжди стає активним
    });

    // 2. Оновлюємо квоти відповідно до нового тарифу
    await updateWorkspaceQuotas(workspaceId, newTier);

    // TODO: Інтегрувати з реальною платіжною системою (Paddle, Fondy).
    // TODO: Створювати запис про платіж в таблиці `payments`.
    // TODO: Надсилати емейл з підтвердженням.

    return { success: true };
  } catch (error) {
    console.error("Помилка оновлення підписки:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Невідома помилка при оновленні підписки.",
    };
  }
}

/**
 * Понижує підписку воркспейсу до нового тарифного плану.
 * @param workspaceId - ID робочого простору.
 * @param newTier - Новий, нижчий тарифний план.
 * @returns Об'єкт з результатом операції та можливими попередженнями.
 */
export async function downgradeSubscription(
  workspaceId: string,
  newTier: SubscriptionTier,
): Promise<{ success: boolean; error?: string; warnings?: string[] }> {
  try {
    const warnings: string[] = [];
    const newLimits = WORKSPACE_TIER_LIMITS[newTier];
    if (!newLimits) {
      throw new Error(`Неправильний тарифний план: ${newTier}`);
    }

    // 1. Перевіряємо поточне використання ресурсів
    const quotas = await quotaRepository.getQuotasByWorkspaceId(workspaceId);

    if (quotas) {
      if (quotas.current_contacts > newLimits.contacts) {
        warnings.push(
          `У вас ${quotas.current_contacts} контактів, але новий тариф дозволяє лише ${newLimits.contacts}. Створення нових буде заблоковано.`,
        );
      }
      if (quotas.current_deals > newLimits.deals) {
        warnings.push(
          `У вас ${quotas.current_deals} угод, але новий тариф дозволяє лише ${newLimits.deals}. Створення нових буде заблоковано.`,
        );
      }
      if (quotas.current_users > newLimits.users) {
        warnings.push(
          `У вас ${quotas.current_users} користувачів, але новий тариф дозволяє лише ${newLimits.users}. Будь ласка, деактивуйте зайвих.`,
        );
      }
    }

    // 2. Оновлюємо саму підписку
    await subscriptionRepository.update(workspaceId, { tier: newTier });

    // 3. Оновлюємо квоти відповідно до нового тарифу
    await updateWorkspaceQuotas(workspaceId, newTier);

    // TODO: Надіслати користувачу емейл з попередженнями.

    return {
      success: true,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    console.error("Помилка пониження підписки:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Невідома помилка при пониженні підписки.",
    };
  }
}

/**
 * Скасовує активну підписку для воркспейсу.
 * @param workspaceId - ID робочого простору.
 * @returns Об'єкт з результатом операції.
 */
export async function cancelSubscription(
  workspaceId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await subscriptionRepository.update(workspaceId, {
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    });

    // TODO: Запланувати повну деактивацію воркспейсу або переведення на 'free' тариф
    //       після закінчення оплаченого періоду.
    // TODO: Надіслати емейл з підтвердженням скасування.

    return { success: true };
  } catch (error) {
    console.error("Помилка скасування підписки:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Невідома помилка при скасуванні підписки.",
    };
  }
}

/**
 * Обробляє вебхуки від платіжних провайдерів (Paddle, Fondy тощо).
 * @param provider - Назва провайдера.
 * @param event - Об'єкт події (payload) від платіжної системи.
 * @returns Об'єкт з результатом операції.
 */
export async function handlePaymentWebhook(
  provider: "paddle" | "fondy" | "stripe",
  event: unknown,
): Promise<{ success: boolean; error?: string }> {
  try {
    // const workspaceId = event.data.custom_data.workspace_id;
    // if (!workspaceId) throw new Error("Workspace ID is missing from webhook");

    // TODO: Verify webhook signature before processing
    // const isValid = await verifyWebhookSignature(provider, event);
    // if (!isValid) throw new Error("Invalid webhook signature");

    const eventType = (event as { event_type: string }).event_type;

    switch (eventType) {
      case "subscription.created":
      case "subscription.updated":
        // const newTier = mapProviderTierToInternalTier(event.data.tier_id);
        // await upgradeSubscription(workspaceId, newTier);
        break;
      case "subscription.cancelled":
        // await cancelSubscription(workspaceId);
        break;
      case "payment.succeeded":
        // await subscriptionRepository.update(workspaceId, { status: "active" });
        break;
      case "payment.failed":
        // await subscriptionRepository.update(workspaceId, { status: "past_due" });
        break;
      default:
        console.warn(`Unhandled webhook event type: ${eventType}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Помилка обробки вебхука:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Невідома помилка при обробці вебхука.";
    return { success: false, error: message };
  }
}
