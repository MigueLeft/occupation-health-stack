import {
  pgTable,
  uuid,
  boolean,
  integer,
  date,
  unique,
} from 'drizzle-orm/pg-core';
import { consultations } from '../consultations/consultations.schema';

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
  },
  (t) => [unique('uq_rest_period_consultation').on(t.consultationId)],
);

export type RestPeriod = typeof restPeriods.$inferSelect;
export type NewRestPeriod = typeof restPeriods.$inferInsert;
