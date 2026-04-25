import { pgTable, uuid, varchar, boolean } from 'drizzle-orm/pg-core';

export const diseases = pgTable('diseases', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  isChronic: boolean('is_chronic').notNull().default(false),
});

export type Disease = typeof diseases.$inferSelect;
export type NewDisease = typeof diseases.$inferInsert;
