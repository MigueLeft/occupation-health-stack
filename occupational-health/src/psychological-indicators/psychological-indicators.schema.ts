import { pgTable, uuid, varchar, integer, boolean, unique } from 'drizzle-orm/pg-core';
import { consultations } from '../consultations/consultations.schema';

export const psychologicalIndicators = pgTable('psychological_indicators', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
});

export const psychologicalIndicatorValues = pgTable(
  'psychological_indicator_values',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    indicatorId: uuid('indicator_id')
      .notNull()
      .references(() => psychologicalIndicators.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
  },
  (t) => [unique('uq_indicator_value_name').on(t.indicatorId, t.name)],
);

export const consultationPsychologicalResults = pgTable(
  'consultation_psychological_results',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    consultationId: uuid('consultation_id')
      .notNull()
      .references(() => consultations.id, { onDelete: 'cascade' }),
    indicatorId: uuid('indicator_id')
      .notNull()
      .references(() => psychologicalIndicators.id),
    valueId: uuid('value_id')
      .notNull()
      .references(() => psychologicalIndicatorValues.id),
  },
  (t) => [unique('uq_consultation_indicator').on(t.consultationId, t.indicatorId)],
);

export type PsychologicalIndicator = typeof psychologicalIndicators.$inferSelect;
export type NewPsychologicalIndicator = typeof psychologicalIndicators.$inferInsert;

export type PsychologicalIndicatorValue = typeof psychologicalIndicatorValues.$inferSelect;
export type NewPsychologicalIndicatorValue = typeof psychologicalIndicatorValues.$inferInsert;

export type ConsultationPsychologicalResult = typeof consultationPsychologicalResults.$inferSelect;
export type NewConsultationPsychologicalResult = typeof consultationPsychologicalResults.$inferInsert;
