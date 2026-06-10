import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { eq, isNull, and } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { consultations, Consultation } from './consultations.schema';
import { requests, Request } from '../requests/requests.schema';
import { physicalExams } from '../physical-exams/physical-exams.schema';
import { consultationDiagnostics } from '../consultation-diagnostics/consultation-diagnostics.schema';
import { consultationPsychologicalResults } from '../psychological-indicators/psychological-indicators.schema';
import { examResults } from '../exam-results/exam-results.schema';
import { patients } from '../patients/patients.schema';
import { companies } from '../companies/companies.schema';
import { positions, positionRisks } from '../positions/positions.schema';
import { risks as risksTable } from '../risks/risks.schema';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';

@Injectable()
export class ConsultationsService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  private async buildConsultationResponse(id: string) {
    const [consultation] = await this.db
      .select()
      .from(consultations)
      .where(eq(consultations.id, id));

    if (!consultation) return null;

    const [[physicalExam], examResultsList, diagnosticsList, psychResultsList, [enrichment]] =
      await Promise.all([
        this.db
          .select()
          .from(physicalExams)
          .where(eq(physicalExams.consultationId, id)),
        this.db
          .select()
          .from(examResults)
          .where(eq(examResults.consultationId, id)),
        this.db
          .select()
          .from(consultationDiagnostics)
          .where(eq(consultationDiagnostics.consultationId, id)),
        this.db
          .select({
            indicatorId: consultationPsychologicalResults.indicatorId,
            valueId: consultationPsychologicalResults.valueId,
          })
          .from(consultationPsychologicalResults)
          .where(eq(consultationPsychologicalResults.consultationId, id)),
        this.db
          .select({
            requestDate: requests.requestDate,
            evaluationReason: requests.evaluationReason,
            patientId: requests.patientId,
            requestStatus: requests.status,
            patientFirstName: patients.firstName,
            patientLastName: patients.lastName,
            companyName: companies.name,
            positionName: positions.name,
          })
          .from(requests)
          .leftJoin(patients, eq(requests.patientId, patients.cedula))
          .leftJoin(companies, eq(patients.companyId, companies.id))
          .leftJoin(positions, eq(patients.positionId, positions.id))
          .where(eq(requests.id, consultation.requestId))
          .limit(1),
      ]);

    // Compute rest period from ALL diagnostics with rest (accidents included), days = MAX
    const diagsWithRest = diagnosticsList.filter((d) => d.requiresRest);
    const maxRestDays =
      diagsWithRest.length > 0
        ? Math.max(...diagsWithRest.map((d) => d.restDays ?? 0))
        : null;
    const restPeriod =
      diagsWithRest.length > 0
        ? { requiresRest: true, days: maxRestDays || null }
        : null;

    return {
      ...consultation,
      physicalExam: physicalExam ?? null,
      restPeriod,
      examResults: examResultsList,
      psychologicalIndicatorResults: psychResultsList,
      requestDate: enrichment?.requestDate ?? null,
      evaluationReason: enrichment?.evaluationReason ?? null,
      patientId: enrichment?.patientId ?? null,
      requestStatus: enrichment?.requestStatus ?? null,
      patientName: enrichment ? `${enrichment.patientFirstName} ${enrichment.patientLastName}` : null,
      companyName: enrichment?.companyName ?? null,
      positionName: enrichment?.positionName ?? null,
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
    const [request] = await this.db
      .select()
      .from(requests)
      .where(eq(requests.id, dto.requestId));

    if (!request) {
      throw new BadRequestException(
        `No existe ninguna solicitud con el ID "${dto.requestId}".`,
      );
    }

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

    const updatePayload: Record<string, unknown> = {};
    if (dto.type !== undefined) updatePayload.type = dto.type;
    if (dto.currentTreatment !== undefined)
      updatePayload.currentTreatment = dto.currentTreatment;
    if (dto.interviewConducted !== undefined)
      updatePayload.interviewConducted = dto.interviewConducted;
    if (dto.consultationResult !== undefined)
      updatePayload.consultationResult = dto.consultationResult;
    if (dto.psychologicalResult !== undefined)
      updatePayload.psychologicalResult = dto.psychologicalResult;
    if (dto.psychologicalAptitude !== undefined)
      updatePayload.psychologicalAptitude = dto.psychologicalAptitude;
    if (dto.isHealthy !== undefined) updatePayload.isHealthy = dto.isHealthy;
    if (dto.diagnosisDescription !== undefined)
      updatePayload.diagnosisDescription = dto.diagnosisDescription;
    if (dto.recommendations !== undefined)
      updatePayload.recommendations = { ...dto.recommendations };
    if (dto.observations !== undefined)
      updatePayload.observations = { ...dto.observations };
    if (dto.status !== undefined) updatePayload.status = dto.status;
    if (dto.systemAttendedById !== undefined)
      updatePayload.systemAttendedById = dto.systemAttendedById;
    if (dto.psychologicalSystemAttendedById !== undefined)
      updatePayload.psychologicalSystemAttendedById = dto.psychologicalSystemAttendedById;
    if (dto.medicalAttendedById !== undefined)
      updatePayload.medicalAttendedById = dto.medicalAttendedById;
    if (dto.medicalAttendedByFreeText !== undefined)
      updatePayload.medicalAttendedByFreeText = dto.medicalAttendedByFreeText;
    if (dto.psychologicalAttendedById !== undefined)
      updatePayload.psychologicalAttendedById = dto.psychologicalAttendedById;
    if (dto.psychologicalAttendedByFreeText !== undefined)
      updatePayload.psychologicalAttendedByFreeText =
        dto.psychologicalAttendedByFreeText;
    if (dto.chronicDiseasesSnapshot !== undefined)
      updatePayload.chronicDiseasesSnapshot = dto.chronicDiseasesSnapshot;

    if (dto.status === 'Finalizada' && existing.status !== 'Finalizada') {
      const [request] = await this.db
        .select()
        .from(requests)
        .where(eq(requests.id, existing.requestId))
        .limit(1);
      if (request) {
        const [patient] = await this.db
          .select()
          .from(patients)
          .where(eq(patients.cedula, request.patientId))
          .limit(1);
        if (patient?.positionId) {
          const riskRows = await this.db
            .select({
              id: risksTable.id,
              name: risksTable.name,
              type: risksTable.type,
            })
            .from(positionRisks)
            .innerJoin(risksTable, eq(positionRisks.riskId, risksTable.id))
            .where(
              and(
                eq(positionRisks.positionId, patient.positionId),
                isNull(positionRisks.removedAt),
              ),
            );
          updatePayload.positionRisksSnapshot = riskRows;
        }
      }
    }

    const [updated] = await this.db
      .update(consultations)
      .set(updatePayload)
      .where(eq(consultations.id, id))
      .returning();

    // Actualizar resultados de indicadores psicológicos si se enviaron
    if (dto.psychologicalIndicatorResults !== undefined) {
      await this.db
        .delete(consultationPsychologicalResults)
        .where(eq(consultationPsychologicalResults.consultationId, id));
      if (dto.psychologicalIndicatorResults.length > 0) {
        await this.db.insert(consultationPsychologicalResults).values(
          dto.psychologicalIndicatorResults.map((r) => ({
            consultationId: id,
            indicatorId: r.indicatorId,
            valueId: r.valueId,
          })),
        );
      }
    }

    if (dto.status === 'En Proceso' || dto.status === 'Finalizada') {
      await this.db
        .update(requests)
        .set({
          status: dto.status === 'Finalizada' ? 'Finalizada' : 'En Proceso',
        })
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
