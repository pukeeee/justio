import { InvalidEmailError } from '../errors/invalid-data.error';

/**
 * Value Object для Email.
 * Забезпечує валідацію та інкапсуляцію логіки роботи з email.
 */
export class Email {
  private constructor(public readonly value: string) {}

  /**
   * Статичний фабричний метод для створення Email.
   * @param email Рядок з email.
   * @returns Екземпляр класу Email.
   */
  static create(email: string): Email {
    const normalized = email.trim().toLowerCase();
    const instance = new Email(normalized);
    
    if (!instance.isValid()) {
      throw new InvalidEmailError(normalized);
    }
    
    return instance;
  }

  /**
   * Перевіряє валідність email.
   */
  private isValid(): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(this.value);
  }

  /**
   * Порівнює два Email об'єкти.
   */
  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
