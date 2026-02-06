import { Email } from '../value-objects/email.vo';
import { Phone } from '../value-objects/phone.vo';
import { ContactType } from '../value-objects/contact-type.enum';

/**
 * Головна сутність "Контакт".
 * Реалізована як клас для інкапсуляції бізнес-логіки та валідації.
 */
export class Contact {
  // --- Властивості ---
  public readonly id: string;
  public readonly workspaceId: string;
  public readonly contactType: ContactType;
  public readonly createdAt: Date;

  private _email: Email | null;
  private _phone: Phone | null;
  private _address: string | null;
  private _notes: string | null;
  private _tags: string[] | null;
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
    contactType: ContactType;
    email: Email | null;
    phone: Phone | null;
    address: string | null;
    notes: string | null;
    tags: string[] | null;
    createdBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }) {
    this.id = props.id;
    this.workspaceId = props.workspaceId;
    this.contactType = props.contactType;
    this._email = props.email;
    this._phone = props.phone;
    this._address = props.address;
    this._notes = props.notes;
    this._tags = props.tags;
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
    contactType: ContactType;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    notes?: string | null;
    tags?: string[] | null;
    createdBy?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
  }): Contact {
    const email = props.email ? Email.create(props.email) : null;
    const phone = props.phone ? Phone.create(props.phone) : null;

    return new Contact({
      id: props.id ?? crypto.randomUUID(),
      workspaceId: props.workspaceId,
      contactType: props.contactType,
      email: email,
      phone: phone,
      address: props.address?.trim() ?? null,
      notes: props.notes ?? null,
      tags: props.tags ?? null,
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

  get notes(): string | null {
    return this._notes;
  }

  get tags(): string[] | null {
    return this._tags;
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
    notes?: string | null;
    tags?: string[] | null;
  }): void {
    if (props.email !== undefined) {
      this._email = props.email ? Email.create(props.email) : null;
    }

    if (props.phone !== undefined) {
      this._phone = props.phone ? Phone.create(props.phone) : null;
    }

    if (props.address !== undefined) this._address = props.address?.trim() ?? null;
    if (props.notes !== undefined) this._notes = props.notes;
    if (props.tags !== undefined) this._tags = props.tags;

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
