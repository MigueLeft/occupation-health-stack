import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  jsonb,
  unique,
} from 'drizzle-orm/pg-core';
import { requests } from '../requests/requests.schema';
import { user } from '../auth/auth.schema';

export const CONSULTATION_TYPES = [
  'Medica',
  'Psicologica',
  'Medica/Psicologica',
] as const;
export type ConsultationType = (typeof CONSULTATION_TYPES)[number];

export const CONSULTATION_STATUSES = [
  'Pendiente',
  'En Proceso',
  'Finalizada',
] as const;
export type ConsultationStatus = (typeof CONSULTATION_STATUSES)[number];

export const CONSULTATION_RESULTS = [
  'Apto',
  'No Apto',
  'Apto Condicionado',
] as const;
export type ConsultationResult = (typeof CONSULTATION_RESULTS)[number];

export const PSYCHOLOGICAL_RESULTS = [
  'Completada',
  'En Espera',
  'Incompleta',
] as const;
export type PsychologicalResult = (typeof PSYCHOLOGICAL_RESULTS)[number];

export const PSYCHOLOGICAL_APTITUDES = [
  'Apto',
  'No Apto',
  'Apto Condicionado',
] as const;
export type PsychologicalAptitude = (typeof PSYCHOLOGICAL_APTITUDES)[number];

export type Recommendations = {
  suggestedPPE?: string;
  medicalAdequacyMeasures?: string;
  psychologicalAdequacyMeasures?: string;
};

export const consultations = pgTable(
  'consultations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    status: varchar('status', { length: 20 }).notNull().default('Pendiente'),
    requestId: uuid('request_id')
      .notNull()
      .references(() => requests.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 20 }).notNull(),
    currentTreatment: text('current_treatment'),
    interviewConducted: boolean('interview_conducted'),
    consultationResult: varchar('consultation_result', { length: 30 }),
    psychologicalResult: varchar('psychological_result', { length: 30 }),
    psychologicalAptitude: varchar('psychological_aptitude', { length: 30 }),
    isHealthy: boolean('is_healthy').default(false),
    diagnosisDescription: text('diagnosis_description'),
    recommendations: jsonb('recommendations').$type<Recommendations>(),
    observations: jsonb('observations').$type<{
      medica?: string;
      psicologica?: string;
      aptitudeDetails?: string;
    }>(),
    systemAttendedById: text('system_attended_by_id').references(
      () => user.id,
      { onDelete: 'set null' },
    ),
    medicalAttendedById: text('medical_attended_by_id').references(
      () => user.id,
      { onDelete: 'set null' },
    ),
    medicalAttendedByFreeText: varchar('medical_attended_by_free_text', { length: 255 }),
    psychologicalAttendedById: text('psychological_attended_by_id').references(
      () => user.id,
      { onDelete: 'set null' },
    ),
    psychologicalAttendedByFreeText: varchar('psychological_attended_by_free_text', { length: 255 }),
    positionRisksSnapshot: jsonb('position_risks_snapshot').$type<Array<{ id: string; name: string; type: string }>>(),
  },
  (t) => [unique('uq_consultation_request').on(t.requestId)],
);

export type Consultation = typeof consultations.$inferSelect;
export type NewConsultation = typeof consultations.$inferInsert;
