import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { positions, Position } from './positions.schema';
import { companies } from '../companies/companies.schema';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findAll(companyId?: string): Promise<Position[]> {
    // Permite filtrar por empresa si se proporciona el parámetro
    if (companyId) {
      return this.db
        .select()
        .from(positions)
        .where(eq(positions.companyId, companyId));
    }
    return this.db.select().from(positions);
  }

  async findOne(id: string): Promise<Position> {
    const [position] = await this.db
      .select()
      .from(positions)
      .where(eq(positions.id, id));

    if (!position) {
      throw new NotFoundException(
        `No se encontró ningún cargo con el ID "${id}".`,
      );
    }
    return position;
  }

  async create(dto: CreatePositionDto): Promise<Position> {
    // Verificar que la empresa existe antes de crear el cargo
    const [company] = await this.db
      .select()
      .from(companies)
      .where(eq(companies.id, dto.companyId));

    if (!company) {
      throw new BadRequestException(
        `No existe ninguna empresa con el ID "${dto.companyId}". Debe crear la empresa antes de asignarle cargos.`,
      );
    }

    const [created] = await this.db.insert(positions).values(dto).returning();

    return created;
  }

  async update(id: string, dto: UpdatePositionDto): Promise<Position> {
    await this.findOne(id);

    // Si se cambia la empresa, verificar que la nueva empresa exista
    if (dto.companyId) {
      const [company] = await this.db
        .select()
        .from(companies)
        .where(eq(companies.id, dto.companyId));

      if (!company) {
        throw new BadRequestException(
          `No existe ninguna empresa con el ID "${dto.companyId}".`,
        );
      }
    }

    const [updated] = await this.db
      .update(positions)
      .set(dto)
      .where(eq(positions.id, id))
      .returning();

    return updated;
  }

  async remove(id: string): Promise<Position> {
    await this.findOne(id);

    const [deleted] = await this.db
      .delete(positions)
      .where(eq(positions.id, id))
      .returning();

    return deleted;
  }
}
