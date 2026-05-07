import { pgTable, uuid, varchar, text, primaryKey } from 'drizzle-orm/pg-core';
import { companies } from '../companies/companies.schema';
import { risks } from '../risks/risks.schema';

export const positions = pgTable('positions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  companyId: uuid('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
});

export const positionRisks = pgTable(
  'position_risks',
  {
    positionId: uuid('position_id')
      .notNull()
      .references(() => positions.id, { onDelete: 'cascade' }),
    riskId: uuid('risk_id')
      .notNull()
      .references(() => risks.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.positionId, t.riskId] })],
);

export type Position = typeof positions.$inferSelect;
export type NewPosition = typeof positions.$inferInsert;
