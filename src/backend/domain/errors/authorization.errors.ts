/**
 * Domain Error: Немає прав доступу
 */
export class ForbiddenError extends Error {
  constructor(message: string = "Доступ заборонено") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Domain Error: Потрібна автентифікація
 */
export class UnauthorizedError extends Error {
  constructor(message: string = "Потрібна автентифікація") {
    super(message);
    this.name = "UnauthorizedError";
  }
}
