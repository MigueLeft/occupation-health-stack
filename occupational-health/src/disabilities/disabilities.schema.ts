import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const disabilities = pgTable('disabilities', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
});

export type Disability = typeof disabilities.$inferSelect;
export type NewDisability = typeof disabilities.$inferInsert;
