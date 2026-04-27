import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { requests, Request } from './requests.schema';
import { patients } from '../patients/patients.schema';
import { consultations } from '../consultations/consultations.schema';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';

@Injectable()
export class RequestsService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findAll(patientId?: string): Promise<Request[]> {
    // Permite filtrar las solicitudes por paciente
    if (patientId) {
      return this.db
        .select()
        .from(requests)
        .where(eq(requests.patientId, patientId));
    }
    return this.db.select().from(requests);
  }

  async findOne(id: string): Promise<Request> {
    const [request] = await this.db
      .select()
      .from(requests)
      .where(eq(requests.id, id));

    if (!request) {
      throw new NotFoundException(
        `No se encontró ninguna solicitud con el ID "${id}".`,
      );
    }
    return request;
  }

  async create(dto: CreateRequestDto): Promise<Request> {
    // Verificar que el paciente existe antes de crear la solicitud
    const [patient] = await this.db
      .select()
      .from(patients)
      .where(eq(patients.cedula, dto.patientId));

    if (!patient) {
      throw new BadRequestException(
        `No existe ningún paciente con la cédula "${dto.patientId}". ` +
          `Registre al paciente antes de crear una solicitud.`,
      );
    }

    const [created] = await this.db.insert(requests).values(dto).returning();

    // Crear automáticamente la consulta asociada
    await this.db.insert(consultations).values({
      requestId: created.id,
      type: dto.scheduledConsultationType ?? 'Medica',
      status: 'Pendiente',
    });

    return created;
  }

  async update(id: string, dto: UpdateRequestDto): Promise<Request> {
    await this.findOne(id);

    // Si se cambia el paciente, verificar que el nuevo paciente exista
    if (dto.patientId) {
      const [patient] = await this.db
        .select()
        .from(patients)
        .where(eq(patients.cedula, dto.patientId));

      if (!patient) {
        throw new BadRequestException(
          `No existe ningún paciente con la cédula "${dto.patientId}".`,
        );
      }
    }

    const [updated] = await this.db
      .update(requests)
      .set(dto)
      .where(eq(requests.id, id))
      .returning();

    // Al marcar como No asistio, eliminar la consulta asociada
    if (dto.status === 'No asistio') {
      await this.db
        .delete(consultations)
        .where(eq(consultations.requestId, id));
    }

    return updated;
  }

  async remove(id: string): Promise<Request> {
    await this.findOne(id);

    const [deleted] = await this.db
      .delete(requests)
      .where(eq(requests.id, id))
      .returning();

    return deleted;
  }
}
