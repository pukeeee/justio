/**
 * Domain Events для сутності Contact.
 * Ці події генеруються автоматично при важливих змінах стану контакту.
 */

import { DomainEvent } from "./base.event";
import { ContactType } from "@/backend/domain/entities/contact.entity";

/**
 * Подія: Контакт створено.
 * Генерується при створенні нового контакту.
 */
export class ContactCreatedEvent extends DomainEvent {
  public readonly eventType = "ContactCreated";

  constructor(
    public readonly contactId: string,
    public readonly workspaceId: string,
    public readonly contactType: ContactType,
    public readonly createdBy: string | null,
  ) {
    super();
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      contactId: this.contactId,
      workspaceId: this.workspaceId,
      contactType: this.contactType,
      createdBy: this.createdBy,
    };
  }
}

/**
 * Подія: Контакт оновлено.
 * Генерується при зміні даних контакту.
 */
export class ContactUpdatedEvent extends DomainEvent {
  public readonly eventType = "ContactUpdated";

  constructor(
    public readonly contactId: string,
    public readonly workspaceId: string,
    public readonly changedFields: string[],
  ) {
    super();
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      contactId: this.contactId,
      workspaceId: this.workspaceId,
      changedFields: this.changedFields,
    };
  }
}

/**
 * Подія: Контакт видалено (м'яке видалення).
 */
export class ContactDeletedEvent extends DomainEvent {
  public readonly eventType = "ContactDeleted";

  constructor(
    public readonly contactId: string,
    public readonly workspaceId: string,
  ) {
    super();
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      contactId: this.contactId,
      workspaceId: this.workspaceId,
    };
  }
}

/**
 * Подія: Контакт відновлено з видалених.
 */
export class ContactRestoredEvent extends DomainEvent {
  public readonly eventType = "ContactRestored";

  constructor(
    public readonly contactId: string,
    public readonly workspaceId: string,
  ) {
    super();
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      contactId: this.contactId,
      workspaceId: this.workspaceId,
    };
  }
}
