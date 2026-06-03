import { pgTable, uuid, varchar, text } from 'drizzle-orm/pg-core';

export const riskExposureCategories = pgTable('risk_exposure_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Tipo de riesgo único (ej: Fisico, Quimico, etc.)
  riskType: varchar('risk_type', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  // Condiciones asociadas al tipo de riesgo (opcional)
  conditions: text('conditions'),
  // Efectos en la salud del trabajador (opcional)
  healthEffects: text('health_effects'),
});

export type RiskExposureCategory = typeof riskExposureCategories.$inferSelect;
export type NewRiskExposureCategory =
  typeof riskExposureCategories.$inferInsert;
