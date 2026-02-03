import { pgTable, uuid, text, date, jsonb } from "drizzle-orm/pg-core";
import { contacts } from "./contacts";

export const individuals = pgTable("individuals", {
  id: uuid("id").defaultRandom().primaryKey(),
  contactId: uuid("contact_id")
    .notNull()
    .references(() => contacts.id, { onDelete: "cascade" }),

  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  middleName: text("middle_name"), // по-батькові
  dateOfBirth: date("date_of_birth"),
  taxNumber: text("tax_number"), // РНОКПП
  passportDetails: jsonb("passport_details"), // {series, number, issued_by, issued_date}
});
