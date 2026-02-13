import type { 
  ClientListItem, 
  CreateClientRequest, 
  UpdateClientRequest,
  ClientDetailsResponse,
  ClientType as ApiClientType
} from "@/backend/api/contracts/client.contracts";

/**
 * Тип клієнта для списків та загального відображення.
 * Відповідає контракту ClientListItem з бекенда.
 */
export type Client = ClientListItem;

/**
 * Тип повної інформації про клієнта.
 * Використовується на сторінках деталей.
 */
export type ClientDetails = ClientDetailsResponse;

/**
 * Тип для створення нового контакту.
 * Базується на API контракті CreateClientRequest.
 */
export type CreateClient = CreateClientRequest;

/**
 * Тип для оновлення контакту.
 * Базується на API контракті UpdateClientRequest.
 */
export type UpdateClient = UpdateClientRequest;

/**
 * Допоміжні типи для конкретних видів контактів
 */
export type IndividualContact = Extract<Client, { clientType: "individual" }>;
export type CompanyContact = Extract<Client, { clientType: "company" }>;

/**
 * Типи для вибору (select/radio) у UI.
 * Беремо з API контракту для консистентності.
 */
export type ClientType = ApiClientType;
