import { pgTable, uuid, boolean, unique } from 'drizzle-orm/pg-core';
import { consultations } from '../consultations/consultations.schema';
import { medicalSpecialties } from '../medical-specialties/medical-specialties.schema';

export const consultationReferrals = pgTable(
  'consultation_referrals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // Una consulta solo puede tener un registro de referencia
    consultationId: uuid('consultation_id')
      .notNull()
      .references(() => consultations.id, { onDelete: 'cascade' }),
    requiresReferral: boolean('requires_referral').notNull().default(false),
    // La especialidad médica es opcional (solo aplica si requiere referencia)
    specialtyId: uuid('specialty_id').references(() => medicalSpecialties.id, {
      onDelete: 'set null',
    }),
  },
  (t) => [unique('uq_referral_consultation').on(t.consultationId)],
);

export type ConsultationReferral = typeof consultationReferrals.$inferSelect;
export type NewConsultationReferral = typeof consultationReferrals.$inferInsert;
