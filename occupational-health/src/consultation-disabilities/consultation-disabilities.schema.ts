import { pgTable, uuid, boolean, unique } from 'drizzle-orm/pg-core';
import { consultations } from '../consultations/consultations.schema';
import { disabilities } from '../disabilities/disabilities.schema';

export const consultationDisabilities = pgTable(
  'consultation_disabilities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    consultationId: uuid('consultation_id')
      .notNull()
      .references(() => consultations.id, { onDelete: 'cascade' }),
    hasDisability: boolean('has_disability').notNull().default(false),
    disabilityId: uuid('disability_id').references(() => disabilities.id, {
      onDelete: 'set null',
    }),
  },
  (t) => [unique('uq_disability_consultation').on(t.consultationId)],
);

export type ConsultationDisability = typeof consultationDisabilities.$inferSelect;
export type NewConsultationDisability = typeof consultationDisabilities.$inferInsert;
