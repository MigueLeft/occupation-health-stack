import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const medicalSpecialties = pgTable('medical_specialties', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
});

export type MedicalSpecialty = typeof medicalSpecialties.$inferSelect;
export type NewMedicalSpecialty = typeof medicalSpecialties.$inferInsert;
