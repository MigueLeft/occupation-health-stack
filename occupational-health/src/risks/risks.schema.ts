import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

// Tipos de riesgo del catálogo
export const RISK_TYPES = [
  'Fisico',
  'Quimico',
  'Biologico',
  'Mecanico',
  'Disergonomicos',
  'Psicosocial',
] as const;
export type RiskType = (typeof RISK_TYPES)[number];

export const risks = pgTable('risks', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  type: varchar('type', { length: 50 }).notNull(),
});

export type Risk = typeof risks.$inferSelect;
export type NewRisk = typeof risks.$inferInsert;
