import { Edrpou } from '../value-objects/edrpou.vo';
import { MissingRequiredFieldError } from '../errors/invalid-data.error';

/**
 * Сутність "Компанія" (юридична особа).
 */
export class Company {
  public readonly id: string;
  public readonly contactId: string;
  private _name: string;
  private _taxId: Edrpou | null;

  private constructor(props: {
    id: string;
    contactId: string;
    name: string;
    taxId: Edrpou | null;
  }) {
    this.id = props.id;
    this.contactId = props.contactId;
    this._name = props.name;
    this._taxId = props.taxId;
  }

  /**
   * Фабричний метод для створення компанії.
   */
  public static create(props: {
    id?: string;
    contactId: string;
    name: string;
    taxId?: string | null;
  }): Company {
    if (!props.name?.trim()) throw new MissingRequiredFieldError('Назва компанії');

    const taxId = props.taxId ? Edrpou.create(props.taxId) : null;

    return new Company({
      id: props.id ?? crypto.randomUUID(),
      contactId: props.contactId,
      name: props.name.trim(),
      taxId: taxId,
    });
  }

  // --- Геттери ---

  get name(): string {
    return this._name;
  }

  get taxId(): string | null {
    return this._taxId?.value ?? null;
  }

  // --- Бізнес-логіка ---

  /**
   * Оновлює дані компанії.
   */
  public update(props: {
    name?: string;
    taxId?: string | null;
  }): void {
    if (props.name !== undefined) {
      if (!props.name?.trim()) throw new MissingRequiredFieldError('Назва компанії');
      this._name = props.name.trim();
    }
    
    if (props.taxId !== undefined) {
      this._taxId = props.taxId ? Edrpou.create(props.taxId) : null;
    }
  }
}
