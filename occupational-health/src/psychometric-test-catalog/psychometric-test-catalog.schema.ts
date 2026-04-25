import { pgTable, uuid, varchar, jsonb } from 'drizzle-orm/pg-core';

export const psychometricTestCatalog = pgTable('psychometric_test_catalog', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  // Array de posibles interpretaciones/resultados del test (ej: ["Buena conducta", "Mala conducta"])
  interpretations: jsonb('interpretations').notNull().$type<string[]>(),
});

export type PsychometricTestCatalog =
  typeof psychometricTestCatalog.$inferSelect;
export type NewPsychometricTestCatalog =
  typeof psychometricTestCatalog.$inferInsert;
