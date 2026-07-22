import { pgTable, uuid, unique } from 'drizzle-orm/pg-core';
import { consultations } from '../consultations/consultations.schema';
import { medicalSpecialties } from '../medical-specialties/medical-specialties.schema';

export const consultationReferrals = pgTable(
  'consultation_referrals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // Una consulta puede tener varias referencias, una por especialidad
    consultationId: uuid('consultation_id')
      .notNull()
      .references(() => consultations.id, { onDelete: 'cascade' }),
    // Nullable para preservar referencias históricas registradas antes de exigir especialidad
    specialtyId: uuid('specialty_id').references(() => medicalSpecialties.id, {
      onDelete: 'set null',
    }),
  },
  (t) => [
    unique('uq_cr_consultation_specialty').on(t.consultationId, t.specialtyId),
  ],
);

export type ConsultationReferral = typeof consultationReferrals.$inferSelect;
export type NewConsultationReferral = typeof consultationReferrals.$inferInsert;
