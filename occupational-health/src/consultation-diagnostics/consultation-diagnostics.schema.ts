import { pgTable, uuid, boolean, integer } from 'drizzle-orm/pg-core';
import { consultations } from '../consultations/consultations.schema';
import { diseaseCategories } from '../disease-categories/disease-categories.schema';
import { diseases } from '../diseases/diseases.schema';
import { bodySystems } from '../body-systems/body-systems.schema';
import { accidentTypes } from '../accident-types/accident-types.schema';

export const consultationDiagnostics = pgTable('consultation_diagnostics', {
  id: uuid('id').primaryKey().defaultRandom(),
  consultationId: uuid('consultation_id')
    .notNull()
    .references(() => consultations.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => diseaseCategories.id),
  diseaseId: uuid('disease_id').references(() => diseases.id),
  bodySystemId: uuid('body_system_id').references(() => bodySystems.id),
  accidentTypeId: uuid('accident_type_id').references(() => accidentTypes.id),
  requiresRest: boolean('requires_rest').notNull().default(false),
  restDays: integer('rest_days'),
});

export type ConsultationDiagnostic =
  typeof consultationDiagnostics.$inferSelect;
export type NewConsultationDiagnostic =
  typeof consultationDiagnostics.$inferInsert;
