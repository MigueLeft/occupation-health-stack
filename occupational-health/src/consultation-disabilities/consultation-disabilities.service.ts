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
  consultationDisabilities,
  ConsultationDisability,
} from './consultation-disabilities.schema';
import { disabilities } from '../disabilities/disabilities.schema';
import { consultations } from '../consultations/consultations.schema';
import { requests } from '../requests/requests.schema';
import { AddConsultationDisabilityDto } from './dto/add-consultation-disability.dto';

@Injectable()
export class ConsultationDisabilitiesService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findByConsultation(
    consultationId: string,
  ): Promise<ConsultationDisability[]> {
    return this.db
      .select()
      .from(consultationDisabilities)
      .where(eq(consultationDisabilities.consultationId, consultationId));
  }

  async findByPatient(
    patientCedula: string,
  ): Promise<{ id: string; name: string }[]> {
    return this.db
      .selectDistinct({ id: disabilities.id, name: disabilities.name })
      .from(consultationDisabilities)
      .innerJoin(
        consultations,
        eq(consultationDisabilities.consultationId, consultations.id),
      )
      .innerJoin(requests, eq(consultations.requestId, requests.id))
      .innerJoin(
        disabilities,
        eq(consultationDisabilities.disabilityId, disabilities.id),
      )
      .where(eq(requests.patientId, patientCedula))
      .orderBy(disabilities.name);
  }

  async add(
    dto: AddConsultationDisabilityDto,
  ): Promise<ConsultationDisability> {
    const [existing] = await this.db
      .select()
      .from(consultationDisabilities)
      .where(
        and(
          eq(consultationDisabilities.consultationId, dto.consultationId),
          eq(consultationDisabilities.disabilityId, dto.disabilityId),
        ),
      );

    if (existing) {
      throw new ConflictException(
        'Esta discapacidad ya está registrada en la consulta.',
      );
    }

    const [created] = await this.db
      .insert(consultationDisabilities)
      .values({
        consultationId: dto.consultationId,
        disabilityId: dto.disabilityId,
      })
      .returning();

    return created;
  }

  async remove(id: string): Promise<void> {
    const [record] = await this.db
      .select()
      .from(consultationDisabilities)
      .where(eq(consultationDisabilities.id, id));

    if (!record) {
      throw new NotFoundException(
        `No se encontró el registro de discapacidad con ID "${id}".`,
      );
    }

    await this.db
      .delete(consultationDisabilities)
      .where(eq(consultationDisabilities.id, id));
  }
}
