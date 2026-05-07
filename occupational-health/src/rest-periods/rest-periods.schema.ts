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

// Motivos de reposo médico
export const REST_PERIOD_REASONS = [
  'Accidente Comun',
  'Accidente Laboral',
  'Enfermedad Comun',
  'Enfermedad Laboral',
  'Maternidad',
  'Otro',
] as const;
export type RestPeriodReason = (typeof REST_PERIOD_REASONS)[number];

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
    reason: varchar('reason', { length: 50 }),
    diseaseId: uuid('disease_id').references(() => diseases.id, { onDelete: 'set null' }),
  },
  (t) => [unique('uq_rest_period_consultation').on(t.consultationId)],
);

export type RestPeriod = typeof restPeriods.$inferSelect;
export type NewRestPeriod = typeof restPeriods.$inferInsert;
