import { Client } from "@/backend/domain/entities/client.entity";
import { ClientType } from "@/backend/domain/value-objects/client-type.enum";

/**
 * Тип, що відповідає структурі таблиці 'clients' у Drizzle.
 */
type DbClient = {
  id: string;
  workspaceId: string;
  clientType: "individual" | "company";
  email: string | null;
  phone: string | null;
  address: string | null;
  note: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

/**
 * Мапер для перетворення даних між базою даних та доменом для сутності Client.
 */
export class ClientMapper {
  /**
   * Перетворює дані з БД у сутність домену.
   */
  static toDomain(raw: DbClient): Client {
    return Client.create({
      id: raw.id,
      workspaceId: raw.workspaceId,
      clientType: raw.clientType as ClientType,
      email: raw.email,
      phone: raw.phone,
      address: raw.address,
      note: raw.note,
      createdBy: raw.createdBy,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  /**
   * Перетворює сутність домену у формат для збереження в БД.
   */
  static toPersistence(client: Client) {
    return {
      id: client.id,
      workspaceId: client.workspaceId,
      clientType: client.clientType,
      email: client.email,
      phone: client.phone,
      address: client.address,
      note: client.note,
      createdBy: client.createdBy,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      deletedAt: client.deletedAt,
    };
  }
}
