import { pgTable, uuid, boolean, jsonb, unique } from 'drizzle-orm/pg-core';
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
    // Columna legada: referido único (solo lectura, ya no se escribe). Se conserva
    // para poder seguir mostrando los referidos registrados antes de esta funcionalidad.
    specialtyId: uuid('specialty_id').references(() => medicalSpecialties.id, {
      onDelete: 'set null',
    }),
    // Columna nueva: uno o multiples referidos. Toda escritura (creacion o
    // actualizacion) usa esta columna exclusivamente.
    specialtyIds: jsonb('specialty_ids').$type<string[]>(),
  },
  (t) => [unique('uq_referral_consultation').on(t.consultationId)],
);

export type ConsultationReferral = typeof consultationReferrals.$inferSelect;
export type NewConsultationReferral = typeof consultationReferrals.$inferInsert;
