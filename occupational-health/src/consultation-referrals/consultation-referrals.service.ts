import { Injectable, Inject } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import {
  consultationReferrals,
  ConsultationReferral,
} from './consultation-referrals.schema';
import { medicalSpecialties } from '../medical-specialties/medical-specialties.schema';
import { UpsertConsultationReferralDto } from './dto/upsert-consultation-referral.dto';

export interface ConsultationReferralView extends ConsultationReferral {
  // IDs efectivos: columna nueva si tiene datos, si no, se hace fallback a la
  // columna vieja (specialtyId) para consultas registradas antes de esta funcionalidad.
  effectiveSpecialtyIds: string[];
  specialties: { id: string; name: string }[];
}

@Injectable()
export class ConsultationReferralsService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  private async findRaw(
    consultationId: string,
  ): Promise<ConsultationReferral | null> {
    const [row] = await this.db
      .select()
      .from(consultationReferrals)
      .where(eq(consultationReferrals.consultationId, consultationId));
    return row ?? null;
  }

  private resolveEffectiveIds(row: ConsultationReferral): string[] {
    if (row.specialtyIds?.length) return row.specialtyIds;
    return row.specialtyId ? [row.specialtyId] : [];
  }

  async findByConsultation(
    consultationId: string,
  ): Promise<ConsultationReferralView | null> {
    const row = await this.findRaw(consultationId);
    if (!row) return null;

    const effectiveSpecialtyIds = this.resolveEffectiveIds(row);

    let specialties: { id: string; name: string }[] = [];
    if (effectiveSpecialtyIds.length) {
      const found = await this.db
        .select({ id: medicalSpecialties.id, name: medicalSpecialties.name })
        .from(medicalSpecialties)
        .where(inArray(medicalSpecialties.id, effectiveSpecialtyIds));
      const nameById = new Map(found.map((s) => [s.id, s.name]));
      specialties = effectiveSpecialtyIds.map((id) => ({
        id,
        name: nameById.get(id) ?? 'Desconocida',
      }));
    }

    return { ...row, effectiveSpecialtyIds, specialties };
  }

  async upsert(
    dto: UpsertConsultationReferralDto,
  ): Promise<ConsultationReferral> {
    const existing = await this.findRaw(dto.consultationId);
    const specialtyIds = dto.requiresReferral ? (dto.specialtyIds ?? []) : [];

    if (existing) {
      const [updated] = await this.db
        .update(consultationReferrals)
        .set({
          requiresReferral: dto.requiresReferral,
          specialtyIds,
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
        specialtyIds,
      })
      .returning();

    return created;
  }
}
