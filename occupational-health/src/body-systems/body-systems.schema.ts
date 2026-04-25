import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const bodySystems = pgTable('body_systems', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
});

export type BodySystem = typeof bodySystems.$inferSelect;
export type NewBodySystem = typeof bodySystems.$inferInsert;
