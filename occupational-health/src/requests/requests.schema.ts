import { pgTable, uuid, varchar, date } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { patients } from '../patients/patients.schema';

export const EVALUATION_REASONS = [
  'Pre-empleo',
  'Egreso',
  'Pre-vacacional',
  'Post-vacacional',
  'Periodica',
  'Consulta',
  'Post-reposo',
] as const;
export type EvaluationReason = (typeof EVALUATION_REASONS)[number];

export const REQUEST_STATUSES = [
  'Pendiente',
  'En Proceso',
  'Finalizada',
  'No asistio',
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const CONSULTATION_TYPES = [
  'Medica',
  'Psicologica',
  'Medica/Psicologica',
] as const;
export type ConsultationType = (typeof CONSULTATION_TYPES)[number];

export const requests = pgTable('requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  requestDate: date('request_date')
    .notNull()
    .default(sql`CURRENT_DATE`),
  evaluationReason: varchar('evaluation_reason', { length: 50 }).notNull(),
  status: varchar('status', { length: 30 }).notNull().default('Pendiente'),
  patientId: varchar('patient_id', { length: 20 })
    .notNull()
    .references(() => patients.cedula, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  // Solo aplica cuando evaluationReason = 'Consulta'
  scheduledConsultationType: varchar('scheduled_consultation_type', {
    length: 30,
  }),
  performedConsultationType: varchar('performed_consultation_type', {
    length: 30,
  }),
});

export type Request = typeof requests.$inferSelect;
export type NewRequest = typeof requests.$inferInsert;
