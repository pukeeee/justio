/**
 * Базовий клас для всіх помилок домену.
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Специфічна помилка для невалідного email.
 */
export class InvalidEmailError extends DomainError {
  constructor(email: string) {
    super(`Invalid email: ${email}`);
  }
}

/**
 * Специфічна помилка для невалідного телефону.
 */
export class InvalidPhoneError extends DomainError {
  constructor(phone: string) {
    super(`Невалідний номер телефону: ${phone}. Очікується формат +380...`);
  }
}

/**
 * Помилка: Обов'язкове поле відсутнє.
 */
export class MissingRequiredFieldError extends DomainError {
  constructor(fieldName: string) {
    super(`Поле "${fieldName}" є обов'язковим для заповнення`);
  }
}

/**
 * Помилка: Спроба змінити поле, яке не підлягає редагуванню (наприклад, тип контакту).
 */
export class ImmutableFieldUpdateError extends DomainError {
  constructor(fieldName: string) {
    super(`Поле "${fieldName}" не можна змінювати після створення`);
  }
}

/**
 * Помилка для невалідного РНОКПП.
 */
export class InvalidTaxNumberError extends DomainError {
  constructor(value: string) {
    super(`Невалідний РНОКПП: ${value}. Очікується 10 цифр.`);
  }
}

/**
 * Помилка для невалідного ЄДРПОУ.
 */
export class InvalidEdrpouError extends DomainError {
  constructor(value: string) {
    super(`Невалідний код ЄДРПОУ: ${value}. Очікується 8 або 10 цифр.`);
  }
}

/**
 * Помилка для невалідних паспортних даних.
 */
export class InvalidPassportError extends DomainError {
  constructor(message: string) {
    super(`Невалідні паспортні дані: ${message}`);
  }
}

/**
 * Помилка: Сутність не знайдено.
 */
export class EntityNotFoundError extends DomainError {
  constructor(entityName: string, id: string) {
    super(`${entityName} з ID ${id} не знайдено`);
  }
}

/**
 * Помилка: Сутність вже існує (дублікат).
 */
export class DuplicateEntityError extends DomainError {
  constructor(
    public readonly entityName: string,
    public readonly field: string,
    public readonly value: string,
    public readonly fieldKey?: string,
  ) {
    super(`${entityName} з таким ${field} вже існує`);
  }
}
