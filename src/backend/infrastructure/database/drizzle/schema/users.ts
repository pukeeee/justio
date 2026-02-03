import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { userStatusEnum } from "./enums";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // Співпадає з auth.users.id
  email: text("email").notNull(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  status: userStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
