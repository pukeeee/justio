import { pgTable, uuid, text } from "drizzle-orm/pg-core";
import { contacts } from "./contacts";

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  contactId: uuid("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),

  name: text("name").notNull(),
  taxId: text("tax_id"), // ЄДРПОУ
});
