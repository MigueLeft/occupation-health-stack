import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import {
  consultationDisabilities,
  ConsultationDisability,
} from './consultation-disabilities.schema';
import { UpsertConsultationDisabilityDto } from './dto/upsert-consultation-disability.dto';

@Injectable()
export class ConsultationDisabilitiesService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findByConsultation(
    consultationId: string,
  ): Promise<ConsultationDisability | null> {
    const [record] = await this.db
      .select()
      .from(consultationDisabilities)
      .where(eq(consultationDisabilities.consultationId, consultationId));

    return record ?? null;
  }

  async upsert(dto: UpsertConsultationDisabilityDto): Promise<ConsultationDisability> {
    const existing = await this.findByConsultation(dto.consultationId);

    if (existing) {
      const [updated] = await this.db
        .update(consultationDisabilities)
        .set({
          hasDisability: dto.hasDisability,
          disabilityId: dto.disabilityId ?? null,
        })
        .where(eq(consultationDisabilities.consultationId, dto.consultationId))
        .returning();
      return updated;
    }

    const [created] = await this.db
      .insert(consultationDisabilities)
      .values({
        consultationId: dto.consultationId,
        hasDisability: dto.hasDisability,
        disabilityId: dto.disabilityId ?? null,
      })
      .returning();

    return created;
  }
}
