import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

export type Action = 'view' | 'create' | 'edit' | 'delete';
export type ModulePermissions = Partial<Record<Action, boolean>>;
export type PermissionsMatrix = Record<string, ModulePermissions>;

export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  description: text('description'),
  isVisible: boolean('is_visible').notNull().default(true),
  permissions: jsonb('permissions')
    .$type<PermissionsMatrix>()
    .notNull()
    .default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
