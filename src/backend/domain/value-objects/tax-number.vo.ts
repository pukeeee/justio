import { InvalidTaxNumberError } from '../errors/invalid-data.error';

/**
 * Value Object для РНОКПП (раніше ІПН) фізичної особи.
 * В Україні складається з 10 цифр.
 */
export class TaxNumber {
  private constructor(public readonly value: string) {}

  /**
   * Створює об'єкт РНОКПП з валідацією.
   */
  static create(value: string): TaxNumber {
    const cleaned = value.trim().replace(/\D/g, '');
    
    // В Україні РНОКПП має бути рівно 10 цифр
    if (cleaned.length !== 10) {
      throw new InvalidTaxNumberError(value);
    }
    
    return new TaxNumber(cleaned);
  }

  equals(other: TaxNumber): boolean {
    return this.value === other.value;
  }
}
