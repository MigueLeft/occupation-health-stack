import { pgTable, uuid, jsonb, text, varchar } from 'drizzle-orm/pg-core';
import { consultations } from '../consultations/consultations.schema';
import { exams } from '../exams/exams.schema';

// Resultado posible del examen
export const EXAM_RESULT_VALUES = ['Normal', 'Anormal'] as const;
export type ExamResultValue = (typeof EXAM_RESULT_VALUES)[number];

export const examResults = pgTable('exam_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  consultationId: uuid('consultation_id')
    .notNull()
    .references(() => consultations.id, { onDelete: 'cascade' }),
  examId: uuid('exam_id')
    .notNull()
    .references(() => exams.id),
  // Valor flexible: puede ser texto, número o JSON estructurado
  resultValue: jsonb('result_value'),
  observation: text('observation'),
  // URL al documento almacenado en S3
  url: text('url'),
  result: varchar('result', { length: 20 }),
});

export type ExamResult = typeof examResults.$inferSelect;
export type NewExamResult = typeof examResults.$inferInsert;
