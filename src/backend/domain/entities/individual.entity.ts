import { TaxNumber } from '../value-objects/tax-number.vo';
import { PassportDetails, PassportDetailsProps } from '../value-objects/passport-details.vo';
import { MissingRequiredFieldError } from '../errors/invalid-data.error';

/**
 * Сутність "Фізична особа".
 */
export class Individual {
  public readonly id: string;
  public readonly contactId: string;

  private _firstName: string;
  private _lastName: string;
  private _middleName: string | null;
  private _dateOfBirth: Date | null;
  private _taxNumber: TaxNumber | null;
  private _passportDetails: PassportDetails | null;

  private constructor(props: {
    id: string;
    contactId: string;
    firstName: string;
    lastName: string;
    middleName: string | null;
    dateOfBirth: Date | null;
    taxNumber: TaxNumber | null;
    passportDetails: PassportDetails | null;
  }) {
    this.id = props.id;
    this.contactId = props.contactId;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._middleName = props.middleName;
    this._dateOfBirth = props.dateOfBirth;
    this._taxNumber = props.taxNumber;
    this._passportDetails = props.passportDetails;
  }

  /**
   * Фабричний метод для створення фізичної особи.
   */
  public static create(props: {
    id?: string;
    contactId: string;
    firstName: string;
    lastName: string;
    middleName?: string | null;
    dateOfBirth?: Date | null;
    taxNumber?: string | null;
    passportDetails?: PassportDetailsProps | null;
  }): Individual {
    if (!props.firstName?.trim()) throw new MissingRequiredFieldError('Ім’я');
    if (!props.lastName?.trim()) throw new MissingRequiredFieldError('Прізвище');

    const taxNumber = props.taxNumber ? TaxNumber.create(props.taxNumber) : null;
    const passportDetails = props.passportDetails ? PassportDetails.create(props.passportDetails) : null;

    return new Individual({
      id: props.id ?? crypto.randomUUID(),
      contactId: props.contactId,
      firstName: props.firstName.trim(),
      lastName: props.lastName.trim(),
      middleName: props.middleName ?? null,
      dateOfBirth: props.dateOfBirth ?? null,
      taxNumber: taxNumber,
      passportDetails: passportDetails,
    });
  }

  // --- Геттери ---

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  get middleName(): string | null {
    return this._middleName;
  }

  /**
   * Повертає повне ім'я.
   */
  get fullName(): string {
    return [this._lastName, this._firstName, this._middleName]
      .filter(Boolean)
      .join(' ');
  }

  get dateOfBirth(): Date | null {
    return this._dateOfBirth;
  }

  get taxNumber(): string | null {
    return this._taxNumber?.value ?? null;
  }

  get passportDetails(): PassportDetails | null {
    return this._passportDetails;
  }

  // --- Бізнес-логіка ---

  /**
   * Оновлює дані фізичної особи.
   */
  public update(props: {
    firstName?: string;
    lastName?: string;
    middleName?: string | null;
    dateOfBirth?: Date | null;
    taxNumber?: string | null;
    passportDetails?: PassportDetailsProps | null;
  }): void {
    if (props.firstName !== undefined) {
      if (!props.firstName?.trim()) throw new MissingRequiredFieldError('Ім’я');
      this._firstName = props.firstName.trim();
    }
    
    if (props.lastName !== undefined) {
      if (!props.lastName?.trim()) throw new MissingRequiredFieldError('Прізвище');
      this._lastName = props.lastName.trim();
    }

    if (props.middleName !== undefined) this._middleName = props.middleName;
    if (props.dateOfBirth !== undefined) this._dateOfBirth = props.dateOfBirth;
    
    if (props.taxNumber !== undefined) {
      this._taxNumber = props.taxNumber ? TaxNumber.create(props.taxNumber) : null;
    }

    if (props.passportDetails !== undefined) {
      this._passportDetails = props.passportDetails ? PassportDetails.create(props.passportDetails) : null;
    }
  }
}
