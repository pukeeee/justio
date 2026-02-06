import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { workspaceTierEnum } from './enums';
import { users } from './users';

export const workspaces = pgTable('workspaces', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tier: workspaceTierEnum('tier').default('free').notNull(),
  settings: jsonb('settings').default({
    visibility_mode: "all",
    default_currency: "UAH",
    timezone: "Europe/Kyiv",
    date_format: "DD.MM.YYYY"
  }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
