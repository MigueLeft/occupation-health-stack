import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import {
  consultationReferrals,
  ConsultationReferral,
} from './consultation-referrals.schema';
import { medicalSpecialties } from '../medical-specialties/medical-specialties.schema';
import { UpsertConsultationReferralDto } from './dto/upsert-consultation-referral.dto';

@Injectable()
export class ConsultationReferralsService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findByConsultation(
    consultationId: string,
  ): Promise<(ConsultationReferral & { specialtyName: string | null }) | null> {
    const [row] = await this.db
      .select({
        id: consultationReferrals.id,
        consultationId: consultationReferrals.consultationId,
        requiresReferral: consultationReferrals.requiresReferral,
        specialtyId: consultationReferrals.specialtyId,
        specialtyName: medicalSpecialties.name,
      })
      .from(consultationReferrals)
      .leftJoin(medicalSpecialties, eq(consultationReferrals.specialtyId, medicalSpecialties.id))
      .where(eq(consultationReferrals.consultationId, consultationId));

    return row ? { ...row, specialtyName: row.specialtyName ?? null } : null;
  }

  async upsert(
    dto: UpsertConsultationReferralDto,
  ): Promise<ConsultationReferral> {
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
