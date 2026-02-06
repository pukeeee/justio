/**
 * Помилки автентифікації (Domain Layer).
 */

export class InvalidCredentialsError extends Error {
  constructor(message: string = 'Невірні дані для входу') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}

export class EmailAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`Email ${email} вже зареєстрований`);
    this.name = 'EmailAlreadyExistsError';
  }
}

export class InvalidTokenError extends Error {
  constructor(message: string = 'Невалідний або прострочений токен') {
    super(message);
    this.name = 'InvalidTokenError';
  }
}
