import { pgTable, uuid, text } from "drizzle-orm/pg-core";
import { clients } from "./clients";

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("contact_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),

  name: text("name").notNull(),
  taxId: text("tax_id"), // ЄДРПОУ
});
