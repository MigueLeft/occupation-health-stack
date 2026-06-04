import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const accidentTypes = pgTable('accident_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
});

export type AccidentType = typeof accidentTypes.$inferSelect;
export type NewAccidentType = typeof accidentTypes.$inferInsert;
