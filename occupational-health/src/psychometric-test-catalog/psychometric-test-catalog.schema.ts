import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const psychometricTestCatalog = pgTable('psychometric_test_catalog', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
});

export type PsychometricTestCatalog =
  typeof psychometricTestCatalog.$inferSelect;
export type NewPsychometricTestCatalog =
  typeof psychometricTestCatalog.$inferInsert;
