import { pgTable, uuid, text, date, jsonb, boolean } from "drizzle-orm/pg-core";
import { clients } from "./clients";

export const individuals = pgTable("individuals", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),

  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  middleName: text("middle_name"), // по-батькові
  dateOfBirth: date("date_of_birth"),
  taxNumber: text("tax_number"), // РНОКПП
  isFop: boolean("is_fop").default(false).notNull(),
  passportDetails: jsonb("passport_details"), // {series, number, issued_by, issued_date}
});
