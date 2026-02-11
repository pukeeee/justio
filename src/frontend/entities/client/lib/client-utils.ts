import { Client } from "../model/types";

/**
 * Повертає відображуване ім'я клієнта залежно від його типу.
 */
export function getClientDisplayName(client: Partial<Client>): string {
  if (client.clientType === "individual") {
    return `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim() || "Без імені";
  }
  
  if (client.clientType === "company") {
    return client.companyName ?? "Без назви";
  }

  return "Невідомий клієнт";
}
