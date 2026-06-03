import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { reportConfig, ReportConfig } from './report-config.schema';

@Injectable()
export class ReportConfigService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async getConfig(): Promise<ReportConfig | null> {
    const [row] = await this.db.select().from(reportConfig).limit(1);
    return row ?? null;
  }

  async upsertSelloMedico(selloMedico: string | null): Promise<ReportConfig> {
    const existing = await this.getConfig();
    if (existing) {
      const [updated] = await this.db
        .update(reportConfig)
        .set({ selloMedico })
        .returning();
      return updated;
    }
    const [created] = await this.db
      .insert(reportConfig)
      .values({ selloMedico })
      .returning();
    return created;
  }
}
