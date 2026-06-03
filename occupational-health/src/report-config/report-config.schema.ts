import { pgTable, uuid, text } from 'drizzle-orm/pg-core';

export const reportConfig = pgTable('report_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  selloMedico: text('sello_medico'),
});

export type ReportConfig = typeof reportConfig.$inferSelect;
export type NewReportConfig = typeof reportConfig.$inferInsert;
