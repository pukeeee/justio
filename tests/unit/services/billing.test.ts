/**
 * @file Unit-тести для `billing.service.ts`.
 * @description Ці тести перевіряють бізнес-логіку, пов'язану з управлінням підписками та квотами,
 * в ізольованому середовищі. Залежності від репозиторіїв мокуються за допомогою `vi.mock`.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getSubscriptionByWorkspaceId,
  updateWorkspaceQuotas,
  upgradeSubscription,
  downgradeSubscription,
  cancelSubscription,
} from "@/shared/lib/services/billing.service";
import * as subscriptionRepository from "@/shared/lib/repositories/subscription.repository";
import * as quotaRepository from "@/shared/lib/repositories/quota.repository";
import {
  mockFreeSubscription,
  mockStarterSubscription,
  mockFreeQuota,
  mockQuotaExceeded,
} from "../../lib/fixtures/billing";
import { mockWorkspaceId } from "../../lib/fixtures/workspaces";

// Повністю мокуємо модулі репозиторіїв, щоб замінити їх реалізації на шпигунів.
vi.mock("@/shared/lib/repositories/subscription.repository");
vi.mock("@/shared/lib/repositories/quota.repository");

/**
 * @group Unit-тести сервісу білінгу
 * @description Тестує всю бізнес-логіку, пов'язану з підписками.
 */
describe("billing.service", () => {
  /**
   * @hook beforeEach
   * @description Очищує всі моки перед кожним тестом для забезпечення їхньої незалежності.
   */
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * @suite getSubscriptionByWorkspaceId
   * @description Тестує логіку отримання підписки.
   */
  describe("getSubscriptionByWorkspaceId", () => {
    /**
     * @test Повинен повертати об'єкт підписки, якщо репозиторій її знаходить.
     */
    it("повертає підписку, якщо вона існує", async () => {
      // Arrange: Налаштовуємо мок репозиторію, щоб він повертав тестову підписку.
      vi.mocked(subscriptionRepository.getByWorkspaceId).mockResolvedValue(
        mockFreeSubscription,
      );

      // Act: Викликаємо сервісну функцію.
      const result = await getSubscriptionByWorkspaceId(mockWorkspaceId);

      // Assert: Перевіряємо, що функція повернула очікувані дані, і що репозиторій був викликаний.
      expect(result).toEqual(mockFreeSubscription);
      expect(subscriptionRepository.getByWorkspaceId).toHaveBeenCalledWith(
        mockWorkspaceId,
      );
    });

    /**
     * @test Повинен повертати null, якщо репозиторій не знаходить підписку.
     */
    it("повертає null, якщо підписку не знайдено", async () => {
      vi.mocked(subscriptionRepository.getByWorkspaceId).mockResolvedValue(
        null,
      );

      const result = await getSubscriptionByWorkspaceId(mockWorkspaceId);

      expect(result).toBeNull();
    });

    /**
     * @test Повинен повертати null, якщо репозиторій викидає помилку.
     * @description Сервісний шар повинен граційно обробляти помилки з нижчих шарів.
     */
    it("повертає null при помилці", async () => {
      vi.mocked(subscriptionRepository.getByWorkspaceId).mockRejectedValue(
        new Error("DB error"),
      );

      const result = await getSubscriptionByWorkspaceId(mockWorkspaceId);

      expect(result).toBeNull();
    });
  });

  /**
   * @suite updateWorkspaceQuotas
   * @description Тестує логіку оновлення квот на основі тарифного плану.
   */
  describe("updateWorkspaceQuotas", () => {
    /**
     * @test Повинен викликати оновлення квот з правильними лімітами для тарифу 'free'.
     */
    it("оновлює квоти для free тарифу", async () => {
      vi.mocked(quotaRepository.updateQuotas).mockResolvedValue({
        ...mockFreeQuota,
      });

      await updateWorkspaceQuotas(mockWorkspaceId, "free");

      expect(quotaRepository.updateQuotas).toHaveBeenCalledWith(
        mockWorkspaceId,
        {
          max_users: 2,
          max_contacts: 100,
          max_deals: 50,
          max_storage_mb: 500,
        },
      );
    });

    /**
     * @test Повинен викликати оновлення квот з правильними лімітами для тарифу 'starter'.
     */
    it("оновлює квоти для starter тарифу", async () => {
      vi.mocked(quotaRepository.updateQuotas).mockResolvedValue({
        ...mockFreeQuota,
        max_users: 5,
        max_contacts: 5000,
        max_deals: 1000,
        max_storage_mb: 5120,
      });

      await updateWorkspaceQuotas(mockWorkspaceId, "starter");

      expect(quotaRepository.updateQuotas).toHaveBeenCalledWith(
        mockWorkspaceId,
        {
          max_users: 5,
          max_contacts: 5000,
          max_deals: 1000,
          max_storage_mb: 5120,
        },
      );
    });

    /**
     * @test Повинен викидати помилку при спробі оновити квоти для неіснуючого тарифу.
     */
    it("викидає помилку для невалідного тарифу", async () => {
      await expect(
        updateWorkspaceQuotas(mockWorkspaceId, "invalid_tier"),
      ).rejects.toThrow("Неправильний тарифний план");
    });

    /**
     * @test Повинен викидати помилку, якщо репозиторій квот не зміг виконати оновлення.
     */
    it("викидає помилку при невдачі оновлення квот", async () => {
      vi.mocked(quotaRepository.updateQuotas).mockRejectedValue(
        new Error("DB error"),
      );

      await expect(
        updateWorkspaceQuotas(mockWorkspaceId, "pro"),
      ).rejects.toThrow("Не вдалося оновити квоти воркспейсу");
    });
  });

  /**
   * @suite upgradeSubscription
   * @description Тестує логіку оновлення підписки на вищий тариф.
   */
  describe("upgradeSubscription", () => {
    /**
     * @test Повинен успішно оновити підписку та квоти.
     */
    it("успішно оновлює підписку до вищого тарифу", async () => {
      // Arrange: Налаштовуємо успішні відповіді від обох репозиторіїв.
      vi.mocked(subscriptionRepository.update).mockResolvedValue({
        ...mockStarterSubscription,
        tier: "pro",
      });
      vi.mocked(quotaRepository.updateQuotas).mockResolvedValue({
        ...mockFreeQuota,
        max_users: 20,
      });

      // Act: Виконуємо оновлення.
      const result = await upgradeSubscription(mockWorkspaceId, "pro");

      // Assert: Перевіряємо успішний результат та виклики репозиторіїв.
      expect(result.success).toBe(true);
      expect(subscriptionRepository.update).toHaveBeenCalledWith(
        mockWorkspaceId,
        { tier: "pro", status: "active" },
      );
      expect(quotaRepository.updateQuotas).toHaveBeenCalled();
    });

    /**
     * @test Повинен повертати помилку, якщо оновлення підписки в репозиторії не вдалося.
     */
    it("повертає помилку при невдачі оновлення підписки", async () => {
      vi.mocked(subscriptionRepository.update).mockRejectedValue(
        new Error("DB error"),
      );

      const result = await upgradeSubscription(mockWorkspaceId, "pro");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  /**
   * @suite downgradeSubscription
   * @description Тестує логіку пониження тарифного плану.
   */
  describe("downgradeSubscription", () => {
    /**
     * @test Повинен успішно понизити тариф, якщо ліміти не перевищено.
     */
    it("успішно понижує підписку без попереджень", async () => {
      // Arrange: Поточне використання не перевищує ліміти нового тарифу.
      vi.mocked(quotaRepository.getQuotasByWorkspaceId).mockResolvedValue(
        mockFreeQuota,
      );
      vi.mocked(subscriptionRepository.update).mockResolvedValue({
        ...mockStarterSubscription,
        tier: "free",
      });
      vi.mocked(quotaRepository.updateQuotas).mockResolvedValue(mockFreeQuota);

      // Act: Понижуємо тариф.
      const result = await downgradeSubscription(mockWorkspaceId, "free");

      // Assert: Очікуємо успішний результат без попереджень.
      expect(result.success).toBe(true);
      expect(result.warnings).toBeUndefined();
    });

    /**
     * @test Повинен повертати попередження, якщо поточне використання перевищує ліміти нового тарифу.
     */
    it("повертає попередження при перевищенні лімітів", async () => {
      // Arrange: Поточне використання перевищує ліміти.
      vi.mocked(quotaRepository.getQuotasByWorkspaceId).mockResolvedValue(
        mockQuotaExceeded,
      );
      vi.mocked(subscriptionRepository.update).mockResolvedValue({
        ...mockStarterSubscription,
        tier: "free",
      });
      vi.mocked(quotaRepository.updateQuotas).mockResolvedValue(mockFreeQuota);

      // Act: Понижуємо тариф.
      const result = await downgradeSubscription(mockWorkspaceId, "free");

      // Assert: Очікуємо успішний результат, але з масивом попереджень.
      expect(result.success).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings?.length).toBeGreaterThan(0);
      expect(result.warnings?.[0]).toContain("контактів");
    });

    /**
     * @test Повинен повертати помилку при спробі понизити до невалідного тарифу.
     */
    it("повертає помилку при невалідному тарифі", async () => {
      vi.mocked(quotaRepository.getQuotasByWorkspaceId).mockResolvedValue(
        mockFreeQuota,
      );

      // @ts-expect-error Тестуємо невалідний тариф.
      const result = await downgradeSubscription(mockWorkspaceId, "invalid");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Неправильний тарифний план");
    });
  });

  /**
   * @suite cancelSubscription
   * @description Тестує логіку скасування підписки.
   */
  describe("cancelSubscription", () => {
    /**
     * @test Повинен успішно скасувати підписку.
     */
    it("успішно скасовує підписку", async () => {
      vi.mocked(subscriptionRepository.update).mockResolvedValue({
        ...mockFreeSubscription,
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      });

      const result = await cancelSubscription(mockWorkspaceId);

      expect(result.success).toBe(true);
      expect(subscriptionRepository.update).toHaveBeenCalledWith(
        mockWorkspaceId,
        expect.objectContaining({
          status: "cancelled",
          cancelled_at: expect.any(String),
        }),
      );
    });

    /**
     * @test Повинен повертати помилку, якщо скасування в репозиторії не вдалося.
     */
    it("повертає помилку при невдачі скасування", async () => {
      vi.mocked(subscriptionRepository.update).mockRejectedValue(
        new Error("DB error"),
      );

      const result = await cancelSubscription(mockWorkspaceId);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
