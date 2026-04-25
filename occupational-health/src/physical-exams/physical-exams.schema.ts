import {
  pgTable,
  uuid,
  real,
  integer,
  text,
  unique,
} from 'drizzle-orm/pg-core';
import { consultations } from '../consultations/consultations.schema';

export const physicalExams = pgTable(
  'physical_exams',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // Una consulta solo tiene un examen físico
    consultationId: uuid('consultation_id')
      .notNull()
      .references(() => consultations.id, { onDelete: 'cascade' }),
    // Presión arterial (mmHg)
    systolicPressure: integer('systolic_pressure'),
    diastolicPressure: integer('diastolic_pressure'),
    // Frecuencia cardíaca (lpm)
    heartRate: integer('heart_rate'),
    // Peso en kilogramos
    weight: real('weight'),
    // Altura en centímetros
    height: real('height'),
    // Frecuencia respiratoria (rpm)
    respiratoryRate: integer('respiratory_rate'),
    // Saturación de oxígeno (%)
    oxygenSaturation: real('oxygen_saturation'),
    notes: text('notes'),
  },
  (t) => [unique('uq_physical_exam_consultation').on(t.consultationId)],
);

export type PhysicalExam = typeof physicalExams.$inferSelect;
export type NewPhysicalExam = typeof physicalExams.$inferInsert;
