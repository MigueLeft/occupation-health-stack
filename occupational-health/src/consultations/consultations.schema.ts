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

// Tipos de consulta
export const CONSULTATION_TYPES = ['Medica', 'Psicologica'] as const;
export type ConsultationType = (typeof CONSULTATION_TYPES)[number];

// Resultados posibles de la consulta médica
export const CONSULTATION_RESULTS = [
  'Apto',
  'No Apto',
  'Apto Condicionado',
] as const;
export type ConsultationResult = (typeof CONSULTATION_RESULTS)[number];

// Estados posibles del resultado psicológico
export const PSYCHOLOGICAL_RESULTS = [
  'Completada',
  'En Espera',
  'Incompleta',
] as const;
export type PsychologicalResult = (typeof PSYCHOLOGICAL_RESULTS)[number];

// Tipo auxiliar para las recomendaciones del médico (todos opcionales ya que el médico puede completarlos gradualmente)
export type Recommendations = {
  suggestedPPE?: string;
  medicalAdequacyMeasures?: string;
  psychologicalAdequacyMeasures?: string;
};

export const consultations = pgTable(
  'consultations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // Una solicitud solo puede tener una consulta
    requestId: uuid('request_id')
      .notNull()
      .references(() => requests.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 20 }).notNull(),
    // Tratamiento actual que toma el paciente al momento de la consulta
    currentTreatment: text('current_treatment'),
    // Solo aplica para consultas psicológicas
    interviewConducted: boolean('interview_conducted'),
    // Resultado de la evaluación médica (Apto, No Apto, Apto Condicionado)
    consultationResult: varchar('consultation_result', { length: 30 }),
    // Resultado de la evaluación psicológica
    psychologicalResult: varchar('psychological_result', { length: 30 }),
    diagnosisDescription: text('diagnosis_description'),
    // JSON con las recomendaciones del médico (EPP, medidas de adecuación)
    recommendations: jsonb('recommendations').$type<Recommendations>(),
    // Observaciones libres separadas por sección
    observations: jsonb('observations').$type<{
      medica?: string;
      psicologica?: string;
    }>(),
    // Registro de quién atendió la consulta
    systemAttendedById: text('system_attended_by_id').references(
      () => user.id,
      { onDelete: 'set null' },
    ),
    medicalAttendedById: text('medical_attended_by_id').references(
      () => user.id,
      { onDelete: 'set null' },
    ),
    psychologicalAttendedById: text('psychological_attended_by_id').references(
      () => user.id,
      { onDelete: 'set null' },
    ),
  },
  (t) => [unique('uq_consultation_request').on(t.requestId)],
);

export type Consultation = typeof consultations.$inferSelect;
export type NewConsultation = typeof consultations.$inferInsert;
