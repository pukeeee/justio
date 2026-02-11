/**
 * Domain Events для сутності Contact.
 * Ці події генеруються автоматично при важливих змінах стану контакту.
 */

import { DomainEvent } from "./base.event";
import { ClientType } from "@/backend/domain/value-objects/client-type.enum";

/**
 * Подія: Контакт створено.
 * Генерується при створенні нового контакту.
 */
export class ClientCreatedEvent extends DomainEvent {
  public readonly eventType = "ClientCreated";

  constructor(
    public readonly clientId: string,
    public readonly workspaceId: string,
    public readonly contactType: ClientType,
    public readonly createdBy: string | null,
  ) {
    super();
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      clientId: this.clientId,
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
