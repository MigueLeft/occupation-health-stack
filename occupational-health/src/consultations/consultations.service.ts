import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { consultations, Consultation } from './consultations.schema';
import { requests, Request } from '../requests/requests.schema';
import { physicalExams } from '../physical-exams/physical-exams.schema';
import { restPeriods } from '../rest-periods/rest-periods.schema';
import { examResults } from '../exam-results/exam-results.schema';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';

@Injectable()
export class ConsultationsService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  // Construye la respuesta completa de la consulta con sus datos relacionados
  private async buildConsultationResponse(id: string) {
    const [consultation] = await this.db
      .select()
      .from(consultations)
      .where(eq(consultations.id, id));

    if (!consultation) return null;

    const [[physicalExam], [restPeriod], examResultsList] = await Promise.all([
      this.db
        .select()
        .from(physicalExams)
        .where(eq(physicalExams.consultationId, id)),
      this.db
        .select()
        .from(restPeriods)
        .where(eq(restPeriods.consultationId, id)),
      this.db
        .select()
        .from(examResults)
        .where(eq(examResults.consultationId, id)),
    ]);

    return {
      ...consultation,
      physicalExam: physicalExam ?? null,
      restPeriod: restPeriod ?? null,
      examResults: examResultsList,
    };
  }

  async findAll(requestId?: string) {
    const list = requestId
      ? await this.db
          .select()
          .from(consultations)
          .where(eq(consultations.requestId, requestId))
      : await this.db.select().from(consultations);

    return Promise.all(list.map((c) => this.buildConsultationResponse(c.id)));
  }

  async findOne(id: string) {
    const consultation = await this.buildConsultationResponse(id);

    if (!consultation) {
      throw new NotFoundException(
        `No se encontró ninguna consulta con el ID "${id}".`,
      );
    }
    return consultation;
  }

  async create(dto: CreateConsultationDto) {
    // Verificar que la solicitud existe
    const [request] = await this.db
      .select()
      .from(requests)
      .where(eq(requests.id, dto.requestId));

    if (!request) {
      throw new BadRequestException(
        `No existe ninguna solicitud con el ID "${dto.requestId}".`,
      );
    }

    // Una solicitud solo puede tener una consulta
    const [existing] = await this.db
      .select()
      .from(consultations)
      .where(eq(consultations.requestId, dto.requestId));

    if (existing) {
      throw new ConflictException(
        `La solicitud "${dto.requestId}" ya tiene una consulta registrada. ` +
          `Cada solicitud solo puede tener una consulta asociada.`,
      );
    }

    // Validar que los campos psicológicos solo se envíen si el tipo es Psicológica
    if (dto.type === 'Medica' && dto.interviewConducted !== undefined) {
      throw new BadRequestException(
        `El campo "entrevista realizada" solo aplica para consultas de tipo Psicológica.`,
      );
    }

    const [created] = await this.db
      .insert(consultations)
      .values(dto)
      .returning();

    return this.buildConsultationResponse(created.id);
  }

  async update(id: string, dto: UpdateConsultationDto): Promise<Consultation> {
    const existing = await this.buildConsultationResponse(id);

    if (!existing) {
      throw new NotFoundException(
        `No se encontró ninguna consulta con el ID "${id}".`,
      );
    }

    const [updated] = await this.db
      .update(consultations)
      .set(dto)
      .where(eq(consultations.id, id))
      .returning();

    // Sincronizar el estado de la solicitud con el de la consulta
    if (dto.status === 'En Proceso' || dto.status === 'Finalizada') {
      await this.db
        .update(requests)
        .set({ status: dto.status === 'Finalizada' ? 'Finalizada' : 'En Proceso' })
        .where(eq(requests.id, existing.requestId));
    }

    return updated;
  }

  async remove(id: string): Promise<Consultation> {
    const existing = await this.buildConsultationResponse(id);

    if (!existing) {
      throw new NotFoundException(
        `No se encontró ninguna consulta con el ID "${id}".`,
      );
    }

    const [deleted] = await this.db
      .delete(consultations)
      .where(eq(consultations.id, id))
      .returning();

    return deleted;
  }
}
