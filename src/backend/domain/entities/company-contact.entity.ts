import { CompanyContactRole } from '../value-objects/company-contact-role.enum';

/**
 * Сутність, що представляє зв'язок між компанією та фізичною особою.
 */
export class CompanyContact {
  public readonly companyId: string;
  public readonly individualId: string;
  private _role: CompanyContactRole;

  private constructor(props: {
    companyId: string;
    individualId: string;
    role: CompanyContactRole;
  }) {
    this.companyId = props.companyId;
    this.individualId = props.individualId;
    this._role = props.role;
  }

  /**
   * Фабричний метод для створення зв'язку.
   */
  public static create(props: {
    companyId: string;
    individualId: string;
    role: CompanyContactRole;
  }): CompanyContact {
    return new CompanyContact(props);
  }

  // --- Геттери ---

  get role(): CompanyContactRole {
    return this._role;
  }

  // --- Бізнес-логіка ---

  /**
   * Змінює роль контактної особи.
   */
  public changeRole(newRole: CompanyContactRole): void {
    this._role = newRole;
  }
}
