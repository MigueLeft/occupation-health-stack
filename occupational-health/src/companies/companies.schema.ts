import { pgTable, uuid, varchar, text } from 'drizzle-orm/pg-core';
import { geoLocations } from '../geo-catalog/geo-catalog.schema';

export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  address: varchar('address', { length: 500 }).notNull(),
  rif: varchar('rif', { length: 50 }).notNull().unique(),
  contact: varchar('contact', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  logo: text('logo'),
  stateId: uuid('state_id').references(() => geoLocations.id, {
    onDelete: 'set null',
  }),
  cityId: uuid('city_id').references(() => geoLocations.id, {
    onDelete: 'set null',
  }),
  municipalityId: uuid('municipality_id').references(() => geoLocations.id, {
    onDelete: 'set null',
  }),
  parishId: uuid('parish_id').references(() => geoLocations.id, {
    onDelete: 'set null',
  }),
});

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
