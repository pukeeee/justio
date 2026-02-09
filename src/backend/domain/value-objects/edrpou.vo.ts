import { InvalidEdrpouError } from "../errors/invalid-data.error";

/**
 * Value Object для коду ЄДРПОУ юридичної особи.
 * В Україні складається з 8 цифр (іноді 10 для дуже старих записів, але стандарт 8).
 */
export class Edrpou {
  private constructor(public readonly value: string) {}

  /**
   * Створює об'єкт ЄДРПОУ з валідацією.
   */
  static create(value: string): Edrpou {
    const cleaned = value.trim().replace(/\D/g, "");

    // Стандартний ЄДРПОУ - 8 цифр. 10 зустрічається вкрай рідко для специфічних структур.
    if (cleaned.length !== 8) {
      throw new InvalidEdrpouError(value);
    }

    return new Edrpou(cleaned);
  }

  equals(other: Edrpou): boolean {
    return this.value === other.value;
  }
}
