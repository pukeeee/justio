/**
 * Event Dispatcher - відповідає за доставку Domain Events до їх обробників.
 *
 * ПАТТЕРН: Observer / Publish-Subscribe
 *
 * ЯК ПРАЦЮЄ:
 * 1. Обробники реєструються через register()
 * 2. Use Cases викликають dispatch() після зміни стану
 * 3. Dispatcher асинхронно викликає всі зареєстровані обробники
 *
 * ПЕРЕВАГИ:
 * - Слабка зв'язаність (Use Case не знає про обробників)
 * - Легко додавати нові обробники без зміни існуючого коду
 * - Централізоване логування всіх подій
 */

import { DomainEvent } from "@/backend/domain/events/base.event";

/**
 * Тип функції-обробника події.
 */
export type EventHandler<T extends DomainEvent = DomainEvent> = (
  event: T,
) => Promise<void> | void;

/**
 * Singleton Event Dispatcher.
 */
class EventDispatcher {
  /**
   * Мапа: тип події → масив обробників
   */
  private handlers: Map<string, EventHandler[]> = new Map();

  /**
   * Реєстрація обробника для конкретного типу події.
   *
   * @param eventType - Тип події (наприклад, 'ContactCreated')
   * @param handler - Функція-обробник
   */
  public register<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>,
  ): void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler as EventHandler);
    this.handlers.set(eventType, handlers);
  }

  /**
   * Відправка події всім зареєстрованим обробникам.
   *
   * ВАЖЛИВО: Обробка асинхронна. Помилки в обробниках не блокують основну логіку.
   *
   * @param event - Domain Event для відправки
   */
  public async dispatch(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || [];

    // Логуємо подію для audit trail
    console.log(
      `[EventDispatcher] Dispatching event: ${event.eventType}`,
      event.toJSON(),
    );

    // Викликаємо всі обробники паралельно
    const promises = handlers.map(async (handler) => {
      try {
        await handler(event);
      } catch (error) {
        // Помилки в обробниках не повинні ламати основний flow
        console.error(
          `[EventDispatcher] Handler failed for ${event.eventType}:`,
          error,
        );
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Очищення всіх обробників (для тестів).
   */
  public clear(): void {
    this.handlers.clear();
  }
}

// Singleton instance
export const eventDispatcher = new EventDispatcher();
