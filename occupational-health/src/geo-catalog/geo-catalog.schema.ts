import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const GEO_TYPES = ['Estado', 'Ciudad', 'Municipio', 'Parroquia'] as const;
export type GeoType = (typeof GEO_TYPES)[number];

export const geoLocations = pgTable('geo_locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
});

export type GeoLocation = typeof geoLocations.$inferSelect;
export type NewGeoLocation = typeof geoLocations.$inferInsert;
