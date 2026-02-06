import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { contactTypeEnum } from "./enums";
import { workspaces } from "./workspaces";
import { users } from "./users";

export const contacts = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  contactType: contactTypeEnum("contact_type").notNull(),

  // Спільні поля
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  notes: text("notes"),
  tags: text("tags").array(),

  // Метадані
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
