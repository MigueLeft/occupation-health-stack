import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { and, desc, eq, isNotNull, or } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { physicalExams, PhysicalExam } from './physical-exams.schema';
import { consultations } from '../consultations/consultations.schema';
import { requests } from '../requests/requests.schema';
import { CreatePhysicalExamDto } from './dto/create-physical-exam.dto';
import { UpdatePhysicalExamDto } from './dto/update-physical-exam.dto';

export interface LatestPhysicalExam {
  weight: number | null;
  height: number | null;
  recordedAt: string;
}

@Injectable()
export class PhysicalExamsService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findAll(consultationId?: string): Promise<PhysicalExam[]> {
    if (consultationId) {
      return this.db
        .select()
        .from(physicalExams)
        .where(eq(physicalExams.consultationId, consultationId));
    }
    return this.db.select().from(physicalExams);
  }

  // Último examen físico con peso o talla registrados para un paciente,
  // sin importar en qué consulta haya sido tomado.
  async findLatestForPatient(
    patientId: string,
  ): Promise<LatestPhysicalExam | null> {
    const [row] = await this.db
      .select({
        weight: physicalExams.weight,
        height: physicalExams.height,
        recordedAt: requests.requestDate,
      })
      .from(physicalExams)
      .innerJoin(
        consultations,
        eq(physicalExams.consultationId, consultations.id),
      )
      .innerJoin(requests, eq(consultations.requestId, requests.id))
      .where(
        and(
          eq(requests.patientId, patientId),
          or(isNotNull(physicalExams.weight), isNotNull(physicalExams.height)),
        ),
      )
      .orderBy(desc(requests.requestDate), desc(consultations.createdAt))
      .limit(1);

    return row ?? null;
  }

  async findOne(id: string): Promise<PhysicalExam> {
    const [exam] = await this.db
      .select()
      .from(physicalExams)
      .where(eq(physicalExams.id, id));

    if (!exam) {
      throw new NotFoundException(
        `No se encontró ningún examen físico con el ID "${id}".`,
      );
    }
    return exam;
  }

  async create(dto: CreatePhysicalExamDto): Promise<PhysicalExam> {
    // Verificar que la consulta existe
    const [consultation] = await this.db
      .select()
      .from(consultations)
      .where(eq(consultations.id, dto.consultationId));

    if (!consultation) {
      throw new BadRequestException(
        `No existe ninguna consulta con el ID "${dto.consultationId}".`,
      );
    }

    // Una consulta solo puede tener un examen físico
    const [existing] = await this.db
      .select()
      .from(physicalExams)
      .where(eq(physicalExams.consultationId, dto.consultationId));

    if (existing) {
      throw new ConflictException(
        `La consulta "${dto.consultationId}" ya tiene un examen físico registrado. ` +
          `Use PATCH /${existing.id} para actualizar los valores existentes.`,
      );
    }

    const [created] = await this.db
      .insert(physicalExams)
      .values(dto)
      .returning();

    return created;
  }

  async update(id: string, dto: UpdatePhysicalExamDto): Promise<PhysicalExam> {
    await this.findOne(id);

    const updatePayload: Record<string, unknown> = {};
    if (dto.systolicPressure !== undefined)
      updatePayload.systolicPressure = dto.systolicPressure;
    if (dto.diastolicPressure !== undefined)
      updatePayload.diastolicPressure = dto.diastolicPressure;
    if (dto.heartRate !== undefined) updatePayload.heartRate = dto.heartRate;
    if (dto.weight !== undefined) updatePayload.weight = dto.weight;
    if (dto.height !== undefined) updatePayload.height = dto.height;
    if (dto.respiratoryRate !== undefined)
      updatePayload.respiratoryRate = dto.respiratoryRate;
    if (dto.oxygenSaturation !== undefined)
      updatePayload.oxygenSaturation = dto.oxygenSaturation;
    if (dto.notes !== undefined) updatePayload.notes = dto.notes;

    const [updated] = await this.db
      .update(physicalExams)
      .set(updatePayload)
      .where(eq(physicalExams.id, id))
      .returning();

    return updated;
  }

  async remove(id: string): Promise<PhysicalExam> {
    await this.findOne(id);

    const [deleted] = await this.db
      .delete(physicalExams)
      .where(eq(physicalExams.id, id))
      .returning();

    return deleted;
  }
}
