import {
  pgTable,
  varchar,
  date,
  jsonb,
  boolean,
  uuid,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { allergies } from '../allergies/allergies.schema';
import { diseases } from '../diseases/diseases.schema';
import { companies } from '../companies/companies.schema';
import { positions } from '../positions/positions.schema';

export type EmergencyContact = {
  name: string;
  phone: string;
  relationship: string;
};

export const patients = pgTable('patients', {
  cedula: varchar('cedula', { length: 20 }).primaryKey(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  birthDate: date('birth_date'),
  emergencyContact: jsonb('emergency_contact').$type<EmergencyContact>(),
  bloodType: varchar('blood_type', { length: 10 }),
  dominantHand: varchar('dominant_hand', { length: 20 }),
  usesGlasses: boolean('uses_glasses').default(false),
  companyId: uuid('company_id').references(() => companies.id),
  positionId: uuid('position_id').references(() => positions.id),
});

export const patientAllergies = pgTable(
  'patient_allergies',
  {
    patientId: varchar('patient_id', { length: 20 })
      .notNull()
      .references(() => patients.cedula, { onDelete: 'cascade' }),
    allergyId: uuid('allergy_id')
      .notNull()
      .references(() => allergies.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.patientId, t.allergyId] })],
);

export const patientDiseases = pgTable(
  'patient_diseases',
  {
    patientId: varchar('patient_id', { length: 20 })
      .notNull()
      .references(() => patients.cedula, { onDelete: 'cascade' }),
    diseaseId: uuid('disease_id')
      .notNull()
      .references(() => diseases.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.patientId, t.diseaseId] })],
);

export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
