/**
 * Базовий клас для всіх Domain Events.
 * Domain Events - це спосіб повідомити інші частини системи про важливі зміни в домені.
 * 
 * ЧОМУ ЦЕ ПОТРІБНО:
 * 1. Слабка зв'язаність між модулями
 * 2. Можливість додавати side-effects без зміни основної логіки
 * 3. Audit trail (логування всіх подій)
 * 4. Інтеграція з зовнішніми системами (наприклад, відправка email)
 */

export abstract class DomainEvent {
  /**
   * Унікальний ідентифікатор події.
   */
  public readonly eventId: string;
  
  /**
   * Час створення події.
   */
  public readonly occurredAt: Date;
  
  /**
   * Назва типу події (для роутингу).
   */
  public abstract readonly eventType: string;

  constructor() {
    this.eventId = crypto.randomUUID();
    this.occurredAt = new Date();
  }

  /**
   * Серіалізація події для збереження або відправки.
   */
  public toJSON(): Record<string, unknown> {
    return {
      eventId: this.eventId,
      eventType: this.eventType,
      occurredAt: this.occurredAt.toISOString(),
    };
  }
}
