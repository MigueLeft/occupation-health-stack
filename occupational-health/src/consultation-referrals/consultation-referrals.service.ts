import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import {
  consultationReferrals,
  ConsultationReferral,
} from './consultation-referrals.schema';
import { medicalSpecialties } from '../medical-specialties/medical-specialties.schema';
import { AddConsultationReferralDto } from './dto/add-consultation-referral.dto';

@Injectable()
export class ConsultationReferralsService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findByConsultation(
    consultationId: string,
  ): Promise<(ConsultationReferral & { specialtyName: string | null })[]> {
    const rows = await this.db
      .select({
        id: consultationReferrals.id,
        consultationId: consultationReferrals.consultationId,
        specialtyId: consultationReferrals.specialtyId,
        specialtyName: medicalSpecialties.name,
      })
      .from(consultationReferrals)
      .leftJoin(
        medicalSpecialties,
        eq(consultationReferrals.specialtyId, medicalSpecialties.id),
      )
      .where(eq(consultationReferrals.consultationId, consultationId));

    return rows.map((row) => ({
      ...row,
      specialtyName: row.specialtyName ?? null,
    }));
  }

  async add(dto: AddConsultationReferralDto): Promise<ConsultationReferral> {
    const [existing] = await this.db
      .select()
      .from(consultationReferrals)
      .where(
        and(
          eq(consultationReferrals.consultationId, dto.consultationId),
          eq(consultationReferrals.specialtyId, dto.specialtyId),
        ),
      );

    if (existing) {
      throw new ConflictException(
        'Esta especialidad ya está registrada como referencia en la consulta.',
      );
    }

    const [created] = await this.db
      .insert(consultationReferrals)
      .values({
        consultationId: dto.consultationId,
        specialtyId: dto.specialtyId,
      })
      .returning();

    return created;
  }

  async remove(id: string): Promise<void> {
    const [record] = await this.db
      .select()
      .from(consultationReferrals)
      .where(eq(consultationReferrals.id, id));

    if (!record) {
      throw new NotFoundException(
        `No se encontró el registro de referencia con ID "${id}".`,
      );
    }

    await this.db
      .delete(consultationReferrals)
      .where(eq(consultationReferrals.id, id));
  }
}
