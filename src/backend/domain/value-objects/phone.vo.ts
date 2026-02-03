import { InvalidPhoneError } from '../errors/invalid-data.error';

/**
 * Value Object для номера телефону.
 * Інкапсулює логіку, пов'язану з телефоном.
 */
export class Phone {
  private constructor(public readonly value: string) {}

  /**
   * Статичний фабричний метод для створення Phone.
   * @param phone Рядок з номером телефону.
   * @returns Екземпляр класу Phone.
   */
  static create(phone: string): Phone {
    if (!phone) throw new InvalidPhoneError(phone);
    
    // 1. Видаляємо всі символи, крім цифр
    let digits = phone.replace(/\D/g, '');

    // 2. Логіка нормалізації для України
    if (digits.length === 10 && digits.startsWith('0')) {
      // 0671234567 -> 380671234567
      digits = '38' + digits;
    } else if (digits.length === 11 && digits.startsWith('80')) {
      // 80671234567 -> 380671234567
      digits = '3' + digits.substring(1);
    } else if (digits.length === 9) {
      // 671234567 -> 380671234567
      digits = '380' + digits;
    }

    // Додаємо плюс на початок
    const normalized = `+${digits}`;
    const instance = new Phone(normalized);

    if (!instance.isValid()) {
      throw new InvalidPhoneError(phone);
    }
    
    return instance;
  }

  /**
   * Перевіряє валідність номера телефону (український стандарт).
   */
  private isValid(): boolean {
    // Формат +380 та 9 цифр після нього
    const regex = /^\+380\d{9}$/;
    return regex.test(this.value);
  }
}
