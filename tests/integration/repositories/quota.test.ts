/**
 * @file Інтеграційні тести для `quota.repository.ts`.
 * @description Ці тести перевіряють реальну взаємодію з базою даних для функцій, пов'язаних з квотами.
 * Вони гарантують, що операції отримання та оновлення квот працюють коректно.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  getQuotasByWorkspaceId,
  updateQuotas,
} from "@/shared/lib/repositories/quota.repository";
import {
  createTestWorkspace,
  createTestSupabaseClient,
} from "../../lib/helpers/db-setup";

/**
 * @group Інтеграційні тести репозиторію квот
 * @description Тестує функціонал для роботи з квотами робочого простору.
 */
describe.sequential("quota.repository (integration)", () => {
  let testWorkspaceId: string;
  const testClient = createTestSupabaseClient();

  /**
   * @hook beforeEach
   * @description Перед кожним тестом створює новий тестовий робочий простір.
   * Це забезпечує наявність необхідних даних (включаючи квоти) для кожного тесту.
   */
  beforeEach(async () => {
    // Створюємо тестовий workspace перед кожним тестом
    const { workspace } = await createTestWorkspace();
    testWorkspaceId = workspace.id;
  });

  /**
   * @suite getQuotasByWorkspaceId
   * @description Тестує функцію отримання квот за ID робочого простору.
   */
  describe("getQuotasByWorkspaceId", () => {
    /**
     * @test Повинен повертати коректні квоти для існуючого робочого простору.
     */
    it("повертає квоти для існуючого workspace", async () => {
      // Act: Отримуємо квоти.
      const result = await getQuotasByWorkspaceId(testWorkspaceId, testClient);

      // Assert: Перевіряємо, що квоти повернуто і вони відповідають стандартним для free тарифу.
      expect(result).not.toBeNull();
      expect(result?.workspace_id).toBe(testWorkspaceId);
      expect(result?.max_users).toBe(2); // Значення за замовчуванням для free тарифу
      expect(result?.max_contacts).toBe(100);
      expect(result?.max_deals).toBe(50);
      expect(result?.max_storage_mb).toBe(500);
      expect(result?.current_users).toBe(1);
      expect(result?.current_contacts).toBe(0);
      expect(result?.current_deals).toBe(0);
      expect(result?.current_storage_mb).toBe(0);
    });

    /**
     * @test Повинен повертати null для неіснуючого робочого простору.
     */
    it("повертає null для неіснуючого workspace", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      // Act: Робимо запит з неіснуючим ID.
      const result = await getQuotasByWorkspaceId(nonExistentId, testClient);

      // Assert: Очікуємо null.
      expect(result).toBeNull();
    });

    /**
     * @test Повинен викидати помилку при передачі невалідного UUID.
     */
    it("викидає помилку при невалідному UUID", async () => {
      // Assert: Очікуємо помилку від бази даних.
      await expect(
        getQuotasByWorkspaceId("invalid-uuid", testClient)
      ).rejects.toThrow();
    });
  });

  /**
   * @suite updateQuotas
   * @description Тестує функцію оновлення квот.
   */
  describe("updateQuotas", () => {
    /**
     * @test Повинен оновлювати всі ліміти квот.
     */
    it("оновлює ліміти квот", async () => {
      const updates = {
        max_users: 5,
        max_contacts: 5000,
        max_deals: 1000,
        max_storage_mb: 5120,
      };

      // Act: Оновлюємо квоти.
      const result = await updateQuotas(testWorkspaceId, updates, testClient);

      // Assert: Перевіряємо, що всі поля оновилися.
      expect(result).not.toBeNull();
      expect(result.max_users).toBe(5);
      expect(result.max_contacts).toBe(5000);
      expect(result.max_deals).toBe(1000);
      expect(result.max_storage_mb).toBe(5120);

      // Перевіряємо, що поточне використання не змінилося.
      expect(result.current_users).toBe(1);
      expect(result.current_contacts).toBe(0);
    });

    /**
     * @test Повинен оновлювати тільки вказані поля, залишаючи інші без змін.
     */
    it("оновлює тільки вказані поля", async () => {
      const updates = {
        max_contacts: 10000,
      };

      // Act: Оновлюємо тільки одне поле.
      const result = await updateQuotas(testWorkspaceId, updates, testClient);

      // Assert: Перевіряємо, що вказане поле оновилося.
      expect(result.max_contacts).toBe(10000);
      // Assert: Перевіряємо, що інші поля залишилися без змін.
      expect(result.max_users).toBe(2);
      expect(result.max_deals).toBe(50);
    });

    /**
     * @test Повинен коректно оновлювати поточне використання (наприклад, current_contacts).
     */
    it("оновлює поточне використання", async () => {
      const updates = {
        current_contacts: 15,
        current_users: 2,
      };

      // Act: Оновлюємо лічильники використання.
      const result = await updateQuotas(testWorkspaceId, updates, testClient);

      // Assert: Перевіряємо, що лічильники оновилися.
      expect(result.current_contacts).toBe(15);
      expect(result.current_users).toBe(2);

      // Assert: Перевіряємо, що ліміти не змінилися.
      expect(result.max_contacts).toBe(100);
      expect(result.max_users).toBe(2);
    });

    /**
     * @test Повинен викидати помилку при спробі оновити квоти для неіснуючого робочого простору.
     */
    it("викидає помилку для неіснуючого workspace", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      // Assert: Очікуємо помилку, оскільки запис для оновлення не буде знайдено.
      await expect(
        updateQuotas(nonExistentId, { max_users: 5 }, testClient)
      ).rejects.toThrow();
    });
  });
});
