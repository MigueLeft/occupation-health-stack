import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import {
  consultationReferrals,
  ConsultationReferral,
} from './consultation-referrals.schema';
import { UpsertConsultationReferralDto } from './dto/upsert-consultation-referral.dto';

@Injectable()
export class ConsultationReferralsService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findByConsultation(
    consultationId: string,
  ): Promise<ConsultationReferral | null> {
    const [referral] = await this.db
      .select()
      .from(consultationReferrals)
      .where(eq(consultationReferrals.consultationId, consultationId));

    return referral ?? null;
  }

  async upsert(dto: UpsertConsultationReferralDto): Promise<ConsultationReferral> {
    // Intentar actualizar si ya existe, si no, insertar
    const existing = await this.findByConsultation(dto.consultationId);

    if (existing) {
      const [updated] = await this.db
        .update(consultationReferrals)
        .set({
          requiresReferral: dto.requiresReferral,
          specialtyId: dto.specialtyId ?? null,
        })
        .where(eq(consultationReferrals.consultationId, dto.consultationId))
        .returning();
      return updated;
    }

    const [created] = await this.db
      .insert(consultationReferrals)
      .values({
        consultationId: dto.consultationId,
        requiresReferral: dto.requiresReferral,
        specialtyId: dto.specialtyId ?? null,
      })
      .returning();

    return created;
  }
}
