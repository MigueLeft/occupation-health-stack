import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

// Categorías del catálogo de exámenes
export const EXAM_CATEGORIES = [
  'Laboratorio',
  'Estudio de Imagenes',
  'Pruebas Especiales',
] as const;
export type ExamCategory = (typeof EXAM_CATEGORIES)[number];

export const exams = pgTable('exams', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  category: varchar('category', { length: 50 }).notNull(),
});

export type Exam = typeof exams.$inferSelect;
export type NewExam = typeof exams.$inferInsert;
