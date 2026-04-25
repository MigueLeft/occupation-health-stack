import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const allergies = pgTable('allergies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
});

export type Allergy = typeof allergies.$inferSelect;
export type NewAllergy = typeof allergies.$inferInsert;
