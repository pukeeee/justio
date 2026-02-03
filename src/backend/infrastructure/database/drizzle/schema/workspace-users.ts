import { pgTable, uuid, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { workspaceRoleEnum, workspaceUserStatusEnum } from "./enums";
import { users } from "./users";
import { workspaces } from "./workspaces";

export const workspaceUsers = pgTable("workspace_users", {
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  role: workspaceRoleEnum("role").notNull(),
  status: workspaceUserStatusEnum("status").default("active").notNull(),
  
  joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  primaryKey({ columns: [t.workspaceId, t.userId] }),
]);
