import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const diseaseCategories = pgTable('disease_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
});

export type DiseaseCategory = typeof diseaseCategories.$inferSelect;
export type NewDiseaseCategory = typeof diseaseCategories.$inferInsert;
