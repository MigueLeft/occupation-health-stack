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
import { restPeriods, RestPeriod } from './rest-periods.schema';
import { consultations } from '../consultations/consultations.schema';
import { CreateRestPeriodDto } from './dto/create-rest-period.dto';
import { UpdateRestPeriodDto } from './dto/update-rest-period.dto';

@Injectable()
export class RestPeriodsService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findAll(consultationId?: string): Promise<RestPeriod[]> {
    if (consultationId) {
      return this.db
        .select()
        .from(restPeriods)
        .where(eq(restPeriods.consultationId, consultationId));
    }
    return this.db.select().from(restPeriods);
  }

  async findOne(id: string): Promise<RestPeriod> {
    const [restPeriod] = await this.db
      .select()
      .from(restPeriods)
      .where(eq(restPeriods.id, id));

    if (!restPeriod) {
      throw new NotFoundException(
        `No se encontró ningún reposo con el ID "${id}".`,
      );
    }
    return restPeriod;
  }

  async create(dto: CreateRestPeriodDto): Promise<RestPeriod> {
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

    // Una consulta solo puede tener un registro de reposo
    const [existing] = await this.db
      .select()
      .from(restPeriods)
      .where(eq(restPeriods.consultationId, dto.consultationId));

    if (existing) {
      throw new ConflictException(
        `La consulta "${dto.consultationId}" ya tiene un reposo registrado. ` +
          `Use PATCH /${existing.id} para actualizar el reposo existente.`,
      );
    }

    // Validar que si requiere reposo, la fecha de fin sea posterior a la de inicio
    if (dto.requiresRest && dto.startDate && dto.endDate) {
      if (new Date(dto.endDate) <= new Date(dto.startDate)) {
        throw new BadRequestException(
          `La fecha de fin del reposo (${dto.endDate}) debe ser posterior a la fecha de inicio (${dto.startDate}).`,
        );
      }
    }

    const [created] = await this.db.insert(restPeriods).values(dto).returning();

    return created;
  }

  async update(id: string, dto: UpdateRestPeriodDto): Promise<RestPeriod> {
    const existing = await this.findOne(id);

    // Validar fechas si se actualizan
    const startDate = dto.startDate ?? existing.startDate;
    const endDate = dto.endDate ?? existing.endDate;

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      throw new BadRequestException(
        `La fecha de fin del reposo (${endDate}) debe ser posterior a la fecha de inicio (${startDate}).`,
      );
    }

    const [updated] = await this.db
      .update(restPeriods)
      .set(dto)
      .where(eq(restPeriods.id, id))
      .returning();

    return updated;
  }

  async remove(id: string): Promise<RestPeriod> {
    await this.findOne(id);

    const [deleted] = await this.db
      .delete(restPeriods)
      .where(eq(restPeriods.id, id))
      .returning();

    return deleted;
  }
}
