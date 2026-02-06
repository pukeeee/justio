/**
 * Ролі контактних осіб всередині компанії.
 */
export enum CompanyContactRole {
  /** Директор */
  DIRECTOR = 'director',
  /** Засновник */
  FOUNDER = 'founder',
  /** Довірена особа */
  ATTORNEY = 'attorney',
  /** Керівник */
  HEAD = 'head',
  /** Виконуючий обов'язки директора */
  ACTING_DIRECTOR = 'acting_director',
  /** Контактна особа */
  CONTACT_PERSON = 'contact_person',
  /** Бухгалтер */
  ACCOUNTANT = 'accountant',
  /** Юрист */
  LAWYER = 'lawyer',
  /** Менеджер */
  MANAGER = 'manager',
  /** Інше */
  OTHER = 'other'
}
