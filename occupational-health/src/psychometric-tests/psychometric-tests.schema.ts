import { pgTable, uuid, text } from 'drizzle-orm/pg-core';
import { consultations } from '../consultations/consultations.schema';
import { psychometricTestCatalog } from '../psychometric-test-catalog/psychometric-test-catalog.schema';

export const psychometricTests = pgTable('psychometric_tests', {
  id: uuid('id').primaryKey().defaultRandom(),
  consultationId: uuid('consultation_id')
    .notNull()
    .references(() => consultations.id, { onDelete: 'cascade' }),
  catalogTestId: uuid('catalog_test_id')
    .notNull()
    .references(() => psychometricTestCatalog.id),
  observations: text('observations'),
});

export type PsychometricTest = typeof psychometricTests.$inferSelect;
export type NewPsychometricTest = typeof psychometricTests.$inferInsert;
