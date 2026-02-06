/**
 * Об'єкт-значення для слага (короткого ідентифікатора) воркспейсу.
 */
export class WorkspaceSlug {
  private static readonly ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
  private static readonly DEFAULT_LENGTH = 10;

  private constructor(public readonly value: string) {
    this.validate(value);
  }

  /**
   * Створює об'єкт-значення з існуючого рядка.
   * Використовується при завантаженні з бази даних.
   */
  static create(value: string): WorkspaceSlug {
    return new WorkspaceSlug(value);
  }

  /**
   * Генерує новий випадковий слаг.
   * Використовується при створенні нового воркспейсу.
   */
  static generate(length: number = WorkspaceSlug.DEFAULT_LENGTH): WorkspaceSlug {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += WorkspaceSlug.ALPHABET.charAt(
        Math.floor(Math.random() * WorkspaceSlug.ALPHABET.length)
      );
    }
    return new WorkspaceSlug(result);
  }

  /**
   * Перевіряє валідність слага.
   */
  private validate(value: string): void {
    if (value.length < 5 || value.length > 50) {
      throw new Error('Слаг має бути від 5 до 50 символів');
    }

    const regex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!regex.test(value)) {
      throw new Error('Слаг може містити лише маленькі літери, цифри та дефіси');
    }
  }

  /**
   * Повертає рядкове представлення слага.
   */
  toString(): string {
    return this.value;
  }

  /**
   * Перевіряє рівність з іншим слагом.
   */
  equals(other: WorkspaceSlug): boolean {
    return this.value === other.value;
  }
}
