/**
 * @file Unit-тести для `quota.service.ts`.
 * @description Ці тести перевіряють бізнес-логіку сервісу квот,
 * зокрема функцію `canCreateEntity`, в ізольованому середовищі з моками репозиторіїв.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { canCreateEntity } from "@/shared/lib/services/quota.service";
import * as quotaRepository from "@/shared/lib/repositories/quota.repository";
import { mockFreeQuota, mockQuotaAtLimit } from "../../lib/fixtures/billing";
import { mockWorkspaceId } from "../../lib/fixtures/workspaces";

// Повністю мокуємо модуль репозиторію, щоб контролювати його поведінку в тестах.
vi.mock("@/shared/lib/repositories/quota.repository");

/**
 * @group Unit-тести сервісу квот
 * @description Тестує бізнес-логіку, що визначає, чи може користувач створювати нові сутності.
 */
describe("quota.service", () => {
  /**
   * @hook beforeEach
   * @description Перед кожним тестом очищує історію викликів моків.
   */
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * @suite canCreateEntity
   * @description Тестує функцію, яка перевіряє доступність створення сутностей (контактів, угод, користувачів)
   * на основі поточних квот робочого простору.
   */
  describe("canCreateEntity", () => {
    /**
     * @test Повинен повертати `true`, якщо ліміт для контактів ще не вичерпано.
     */
    it("повертає true, коли є вільні місця для контактів", async () => {
      // Arrange: Налаштовуємо мок репозиторію, щоб він повернув квоти, де є вільне місце.
      vi.mocked(quotaRepository.getQuotasByWorkspaceId).mockResolvedValue(
        mockFreeQuota
      );

      // Act: Викликаємо функцію для перевірки можливості створення контакту.
      const result = await canCreateEntity(mockWorkspaceId, "contacts");

      // Assert: Перевіряємо, що результат `true` і репозиторій був викликаний з правильним ID.
      expect(result).toBe(true);
      expect(quotaRepository.getQuotasByWorkspaceId).toHaveBeenCalledWith(
        mockWorkspaceId
      );
    });

    /**
     * @test Повинен повертати `true`, якщо ліміт для угод ще не вичерпано.
     */
    it("повертає true, коли є вільні місця для угод", async () => {
      vi.mocked(quotaRepository.getQuotasByWorkspaceId).mockResolvedValue(
        mockFreeQuota
      );

      const result = await canCreateEntity(mockWorkspaceId, "deals");

      expect(result).toBe(true);
    });

    /**
     * @test Повинен повертати `true`, якщо ліміт для користувачів ще не вичерпано.
     */
    it("повертає true, коли є вільні місця для користувачів", async () => {
      vi.mocked(quotaRepository.getQuotasByWorkspaceId).mockResolvedValue(
        mockFreeQuota
      );

      const result = await canCreateEntity(mockWorkspaceId, "users");

      expect(result).toBe(true);
    });

    /**
     * @test Повинен повертати `false`, якщо ліміт контактів досягнуто.
     */
    it("повертає false, коли ліміт контактів досягнуто", async () => {
      // Arrange: Використовуємо фікстуру, де ліміти вичерпано.
      vi.mocked(quotaRepository.getQuotasByWorkspaceId).mockResolvedValue(
        mockQuotaAtLimit
      );

      const result = await canCreateEntity(mockWorkspaceId, "contacts");

      // Assert: Очікуємо `false`, оскільки місця більше немає.
      expect(result).toBe(false);
    });

    /**
     * @test Повинен повертати `false`, якщо ліміт угод досягнуто.
     */
    it("повертає false, коли ліміт угод досягнуто", async () => {
      vi.mocked(quotaRepository.getQuotasByWorkspaceId).mockResolvedValue(
        mockQuotaAtLimit
      );

      const result = await canCreateEntity(mockWorkspaceId, "deals");

      expect(result).toBe(false);
    });

    /**
     * @test Повинен повертати `false`, якщо ліміт користувачів досягнуто.
     */
    it("повертає false, коли ліміт користувачів досягнуто", async () => {
      vi.mocked(quotaRepository.getQuotasByWorkspaceId).mockResolvedValue(
        mockQuotaAtLimit
      );

      const result = await canCreateEntity(mockWorkspaceId, "users");

      expect(result).toBe(false);
    });

    /**
     * @test Повинен повертати `false`, якщо дані про квоти для воркспейсу відсутні.
     */
    it("повертає false, коли запису про квоти не знайдено", async () => {
      // Arrange: Симулюємо ситуацію, коли репозиторій повертає null.
      vi.mocked(quotaRepository.getQuotasByWorkspaceId).mockResolvedValue(null);

      const result = await canCreateEntity(mockWorkspaceId, "contacts");

      expect(result).toBe(false);
    });

    /**
     * @test Повинен повертати `false`, якщо під час отримання квот сталася помилка.
     * @description Це гарантує, що система поводиться безпечно і не дозволяє створення
     * сутностей, якщо не може перевірити ліміти.
     */
    it("повертає false при помилці отримання квот", async () => {
      // Arrange: Симулюємо помилку від репозиторію.
      vi.mocked(quotaRepository.getQuotasByWorkspaceId).mockRejectedValue(
        new Error("Database error")
      );

      const result = await canCreateEntity(mockWorkspaceId, "contacts");

      expect(result).toBe(false);
    });

    /**
     * @test Повинен повертати `false` при передачі невідомого типу сутності.
     */
    it("повертає false для невідомого типу сутності", async () => {
      vi.mocked(quotaRepository.getQuotasByWorkspaceId).mockResolvedValue(
        mockFreeQuota
      );

      // @ts-expect-error Тестуємо невалідний тип, щоб перевірити обробку помилок.
      const result = await canCreateEntity(mockWorkspaceId, "invalid_type");

      expect(result).toBe(false);
    });
  });
});
