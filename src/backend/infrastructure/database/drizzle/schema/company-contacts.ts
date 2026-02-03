import { pgTable, uuid } from "drizzle-orm/pg-core";
import { companies } from "./companies";
import { individuals } from "./individuals";
import { companyContactRoleEnum } from "./enums";

export const companyContacts = pgTable("company_contacts", {
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  individualId: uuid("individual_id")
    .notNull()
    .references(() => individuals.id, { onDelete: "cascade" }),
  role: companyContactRoleEnum("role").notNull(),
});
