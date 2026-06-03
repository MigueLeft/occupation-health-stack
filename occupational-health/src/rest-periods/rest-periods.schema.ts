import {
  pgTable,
  uuid,
  boolean,
  integer,
  date,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';
import { consultations } from '../consultations/consultations.schema';
import { diseases } from '../diseases/diseases.schema';
import { diseaseCategories } from '../disease-categories/disease-categories.schema';
import { bodySystems } from '../body-systems/body-systems.schema';

export const restPeriods = pgTable(
  'rest_periods',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // Una consulta solo tiene un registro de reposo
    consultationId: uuid('consultation_id')
      .notNull()
      .references(() => consultations.id, { onDelete: 'cascade' }),
    requiresRest: boolean('requires_rest').notNull().default(false),
    // Los siguientes campos son opcionales si no requiere reposo
    days: integer('days'),
    startDate: date('start_date'),
    endDate: date('end_date'),
    // Mantenido por compatibilidad con datos anteriores
    reason: varchar('reason', { length: 50 }),
    diseaseId: uuid('disease_id').references(() => diseases.id, {
      onDelete: 'set null',
    }),
    // Categoría y aparato/sistema del diagnóstico asociado al reposo
    categoryId: uuid('category_id').references(() => diseaseCategories.id, {
      onDelete: 'set null',
    }),
    bodySystemId: uuid('body_system_id').references(() => bodySystems.id, {
      onDelete: 'set null',
    }),
  },
  (t) => [unique('uq_rest_period_consultation').on(t.consultationId)],
);

export type RestPeriod = typeof restPeriods.$inferSelect;
export type NewRestPeriod = typeof restPeriods.$inferInsert;
