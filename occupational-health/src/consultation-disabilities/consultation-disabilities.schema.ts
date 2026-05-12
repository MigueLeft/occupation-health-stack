import { pgTable, uuid, unique } from 'drizzle-orm/pg-core';
import { consultations } from '../consultations/consultations.schema';
import { disabilities } from '../disabilities/disabilities.schema';

export const consultationDisabilities = pgTable(
  'consultation_disabilities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    consultationId: uuid('consultation_id')
      .notNull()
      .references(() => consultations.id, { onDelete: 'cascade' }),
    disabilityId: uuid('disability_id')
      .notNull()
      .references(() => disabilities.id, { onDelete: 'cascade' }),
  },
  (t) => [unique('uq_cd_consultation_disability').on(t.consultationId, t.disabilityId)],
);

export type ConsultationDisability = typeof consultationDisabilities.$inferSelect;
export type NewConsultationDisability = typeof consultationDisabilities.$inferInsert;
