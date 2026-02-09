import { Email } from "../value-objects/email.vo";
import { Phone } from "../value-objects/phone.vo";
import { ClientType } from "../value-objects/client-type.enum";

/**
 * Головна сутність "Клієнт".
 * Реалізована як клас для інкапсуляції бізнес-логіки та валідації.
 */
export class Client {
  // --- Властивості ---
  public readonly id: string;
  public readonly workspaceId: string;
  public readonly clientType: ClientType;
  public readonly createdAt: Date;

  private _email: Email | null;
  private _phone: Phone | null;
  private _address: string | null;
  private _note: string | null;
  private _createdBy: string | null;
  private _updatedAt: Date;
  private _deletedAt: Date | null;

  /**
   * Конструктор є приватним, щоб змусити використовувати фабричний метод `create`.
   * Це гарантує, що всі сутності створюються валідними.
   */
  private constructor(props: {
    id: string;
    workspaceId: string;
    clientType: ClientType;
    email: Email | null;
    phone: Phone | null;
    address: string | null;
    note: string | null;
    createdBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }) {
    this.id = props.id;
    this.workspaceId = props.workspaceId;
    this.clientType = props.clientType;
    this._email = props.email;
    this._phone = props.phone;
    this._address = props.address;
    this._note = props.note;
    this._createdBy = props.createdBy;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._deletedAt = props.deletedAt;
  }

  /**
   * Фабричний метод для створення нового контакту.
   * Виконує валідацію та ініціалізацію.
   */
  public static create(props: {
    id?: string;
    workspaceId: string;
    clientType: ClientType;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    note?: string | null;
    createdBy?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
  }): Client {
    const email = props.email ? Email.create(props.email) : null;
    const phone = props.phone ? Phone.create(props.phone) : null;

    return new Client({
      id: props.id ?? crypto.randomUUID(),
      workspaceId: props.workspaceId,
      clientType: props.clientType,
      email: email,
      phone: phone,
      address: props.address?.trim() ?? null,
      note: props.note ?? null,
      createdBy: props.createdBy ?? null,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
      deletedAt: props.deletedAt ?? null,
    });
  }

  // --- Геттери для доступу до приватних полів ---

  get email(): string | null {
    return this._email?.value ?? null;
  }

  get phone(): string | null {
    return this._phone?.value ?? null;
  }

  get address(): string | null {
    return this._address;
  }

  get note(): string | null {
    return this._note;
  }

  get createdBy(): string | null {
    return this._createdBy;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  // --- Бізнес-логіка ---

  /**
   * Оновлює поля контакту.
   */
  public update(props: {
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    note?: string | null;
  }): void {
    if (props.email !== undefined) {
      this._email = props.email ? Email.create(props.email) : null;
    }

    if (props.phone !== undefined) {
      this._phone = props.phone ? Phone.create(props.phone) : null;
    }

    if (props.address !== undefined)
      this._address = props.address?.trim() ?? null;
    if (props.note !== undefined) this._note = props.note;

    this.touch();
  }

  /**
   * Позначає контакт як видалений.
   */
  public softDelete(): void {
    if (!this._deletedAt) {
      this._deletedAt = new Date();
      this.touch();
    }
  }

  /**
   * Відновлює видалений контакт.
   */
  public restore(): void {
    if (this._deletedAt) {
      this._deletedAt = null;
      this.touch();
    }
  }

  /**
   * Оновлює час останньої зміни.
   */
  private touch(): void {
    this._updatedAt = new Date();
  }
}
