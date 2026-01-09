/**
 * @file Інтеграційні тести для `subscription.repository.ts`.
 * @description Ці тести перевіряють реальну взаємодію з базою даних для функцій, пов'язаних з підписками.
 * Вони гарантують, що CRUD операції для підписок працюють коректно на рівні репозиторію.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  getByWorkspaceId,
  update,
} from "@/shared/lib/repositories/subscription.repository";
import {
  createTestWorkspace,
  createTestSupabaseClient,
} from "../../lib/helpers/db-setup";

/**
 * @group Інтеграційні тести репозиторію підписок
 * @description Тестує функціонал для роботи з підписками, включаючи отримання та оновлення даних.
 */
describe.sequential("subscription.repository (integration)", () => {
  let testWorkspaceId: string;
  const testClient = createTestSupabaseClient();

  /**
   * @hook beforeEach
   * @description Перед кожним тестом створює новий тестовий робочий простір з підпискою.
   * Це забезпечує ізоляцію тестів та чистий стан для кожного сценарію.
   */
  beforeEach(async () => {
    const { workspace } = await createTestWorkspace();
    testWorkspaceId = workspace.id;
  });

  /**
   * @suite getByWorkspaceId
   * @description Тестує функцію отримання підписки за ID робочого простору.
   */
  describe("getByWorkspaceId", () => {
    /**
     * @test Повинен повертати коректну підписку для існуючого робочого простору.
     */
    it("повертає підписку для існуючого workspace", async () => {
      // Act: Викликаємо функцію для отримання підписки.
      const result = await getByWorkspaceId(testWorkspaceId, testClient);

      // Assert: Перевіряємо, що результат не null і містить правильні дані.
      expect(result).not.toBeNull();
      expect(result?.workspace_id).toBe(testWorkspaceId);
      expect(result?.tier).toBe("free");
      expect(result?.status).toBe("active");
      expect(result?.enabled_modules).toEqual([]);
    });

    /**
     * @test Повинен повертати null для неіснуючого робочого простору.
     */
    it("повертає null для неіснуючого workspace", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      // Act: Викликаємо функцію з неіснуючим ID.
      const result = await getByWorkspaceId(nonExistentId, testClient);

      // Assert: Очікуємо null в результаті.
      expect(result).toBeNull();
    });

    /**
     * @test Повинен викидати помилку при передачі невалідного UUID.
     */
    it("викидає помилку при невалідному UUID", async () => {
      // Assert: Очікуємо, що виклик з невалідним UUID призведе до помилки.
      await expect(
        getByWorkspaceId("invalid-uuid", testClient),
      ).rejects.toThrow();
    });
  });

  /**
   * @suite update
   * @description Тестує функцію оновлення підписки.
   */
  describe("update", () => {
    /**
     * @test Повинен коректно оновлювати тарифний план (tier) підписки.
     */
    it("оновлює tier підписки", async () => {
      // Act: Оновлюємо тариф на 'pro'.
      const result = await update(
        testWorkspaceId,
        {
          tier: "pro",
        },
        testClient,
      );

      // Assert: Перевіряємо, що тариф оновився.
      expect(result).not.toBeNull();
      expect(result.tier).toBe("pro");
      expect(result.workspace_id).toBe(testWorkspaceId);
    });

    /**
     * @test Повинен коректно оновлювати статус підписки.
     */
    it("оновлює status підписки", async () => {
      // Act: Оновлюємо статус на 'past_due'.
      const result = await update(
        testWorkspaceId,
        {
          status: "past_due",
        },
        testClient,
      );

      // Assert: Перевіряємо, що статус оновився.
      expect(result.status).toBe("past_due");
    });

    /**
     * @test Повинен коректно оновлювати платіжний період.
     */
    it("оновлює billing_period", async () => {
      // Act: Оновлюємо період на 'annual'.
      const result = await update(
        testWorkspaceId,
        {
          billing_period: "annual",
        },
        testClient,
      );

      // Assert: Перевіряємо, що період оновився.
      expect(result.billing_period).toBe("annual");
    });

    /**
     * @test Повинен коректно оновлювати дані платіжного провайдера.
     */
    it("оновлює payment_provider та external_subscription_id", async () => {
      // Act: Оновлюємо дані провайдера.
      const result = await update(
        testWorkspaceId,
        {
          payment_provider: "paddle",
          external_subscription_id: "sub_123456",
        },
        testClient,
      );

      // Assert: Перевіряємо оновлені поля.
      expect(result.payment_provider).toBe("paddle");
      expect(result.external_subscription_id).toBe("sub_123456");
    });

    /**
     * @test Повинен коректно встановлювати дату скасування при зміні статусу на 'cancelled'.
     */
    it("оновлює cancelled_at при скасуванні", async () => {
      const cancelledAt = new Date();

      // Act: Скасовуємо підписку.
      const result = await update(
        testWorkspaceId,
        {
          status: "cancelled",
          cancelled_at: cancelledAt.toISOString(),
        },
        testClient,
      );

      // Assert: Перевіряємо статус та дату скасування.
      expect(result.status).toBe("cancelled");
      expect(new Date(result.cancelled_at as string).getTime()).toBe(
        cancelledAt.getTime(),
      );
    });

    /**
     * @test Повинен коректно оновлювати список увімкнених модулів.
     */
    it("оновлює enabled_modules", async () => {
      const modules = ["advanced_analytics", "api_access"];

      // Act: Оновлюємо список модулів.
      const result = await update(
        testWorkspaceId,
        {
          enabled_modules: modules,
        },
        testClient,
      );

      // Assert: Перевіряємо, що список модулів оновився.
      expect(result.enabled_modules).toEqual(modules);
    });

    /**
     * @test Повинен коректно оновлювати декілька полів одночасно.
     */
    it("оновлює декілька полів одночасно", async () => {
      const updates = {
        tier: "starter" as const,
        status: "active" as const,
        billing_period: "monthly" as const,
        payment_provider: "fondy" as const,
      };

      // Act: Оновлюємо декілька полів.
      const result = await update(testWorkspaceId, updates, testClient);

      // Assert: Перевіряємо кожне оновлене поле.
      expect(result.tier).toBe("starter");
      expect(result.status).toBe("active");
      expect(result.billing_period).toBe("monthly");
      expect(result.payment_provider).toBe("fondy");
    });

    /**
     * @test Повинен оновлювати поле `updated_at` після будь-якого оновлення.
     * @description Цей тест гарантує, що тригер або логіка оновлення часової мітки працює.
     */
    it("оновлює updated_at timestamp", async () => {
      const beforeUpdate = new Date();

      // Вносимо невелику затримку, щоб гарантувати різницю в часі.
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const result = await update(testWorkspaceId, { tier: "pro" }, testClient);
      const afterUpdate = new Date(result.updated_at);

      // Assert: Перевіряємо, що час оновлення більший за час до оновлення.
      expect(afterUpdate.getTime()).toBeGreaterThan(beforeUpdate.getTime());
    });

    /**
     * @test Повинен викидати помилку при спробі оновити неіснуючу підписку.
     */
    it("викидає помилку для неіснуючого workspace", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      // Assert: Очікуємо помилку при оновленні.
      await expect(
        update(nonExistentId, { tier: "pro" }, testClient),
      ).rejects.toThrow();
    });

    /**
     * @test Повинен викидати помилку при передачі невалідного значення для `tier`.
     */
    it("викидає помилку при невалідному tier", async () => {
      // Assert: Очікуємо помилку від бази даних через невалідний enum.
      await expect(
        // @ts-expect-error Тестуємо передачу невалідного значення.
        update(testWorkspaceId, { tier: "invalid_tier" }, testClient),
      ).rejects.toThrow();
    });

    /**
     * @test Повинен викидати помилку при передачі невалідного значення для `status`.
     */
    it("викидає помилку при невалідному status", async () => {
      // Assert: Очікуємо помилку від бази даних через невалідний enum.
      await expect(
        // @ts-expect-error Тестуємо передачу невалідного значення.
        update(testWorkspaceId, { status: "invalid_status" }, testClient),
      ).rejects.toThrow();
    });
  });
});
