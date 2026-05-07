import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { positions, positionRisks, Position } from './positions.schema';
import { companies } from '../companies/companies.schema';
import { patients } from '../patients/patients.schema';
import { risks } from '../risks/risks.schema';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  private async getRisksForPosition(positionId: string) {
    const rows = await this.db
      .select({
        id: risks.id,
        name: risks.name,
        type: risks.type,
      })
      .from(positionRisks)
      .innerJoin(risks, eq(positionRisks.riskId, risks.id))
      .where(eq(positionRisks.positionId, positionId));

    return rows.sort((a, b) => a.type.localeCompare(b.type));
  }

  async findAll(companyId?: string) {
    const list = companyId
      ? await this.db
          .select()
          .from(positions)
          .where(eq(positions.companyId, companyId))
      : await this.db.select().from(positions);

    return Promise.all(
      list.map(async (p) => ({
        ...p,
        risks: await this.getRisksForPosition(p.id),
      })),
    );
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

    const [linkedPatient] = await this.db
      .select({ cedula: patients.cedula })
      .from(patients)
      .where(eq(patients.positionId, id))
      .limit(1);

    if (linkedPatient) {
      throw new ConflictException(
        'No se puede eliminar este cargo porque tiene pacientes asociados. Reasigne o elimine los pacientes primero.',
      );
    }

    const [deleted] = await this.db
      .delete(positions)
      .where(eq(positions.id, id))
      .returning();

    return deleted;
  }

  async addRisk(positionId: string, riskId: string) {
    await this.findOne(positionId);

    const [risk] = await this.db
      .select()
      .from(risks)
      .where(eq(risks.id, riskId));

    if (!risk) {
      throw new NotFoundException(
        `No se encontró ningún riesgo con el ID "${riskId}".`,
      );
    }

    const [existing] = await this.db
      .select()
      .from(positionRisks)
      .where(
        and(
          eq(positionRisks.positionId, positionId),
          eq(positionRisks.riskId, riskId),
        ),
      );

    if (existing) {
      throw new ConflictException(
        `El riesgo "${risk.name}" ya está asociado a este cargo.`,
      );
    }

    await this.db.insert(positionRisks).values({ positionId, riskId });
    return this.getRisksForPosition(positionId);
  }

  async removeRisk(positionId: string, riskId: string) {
    await this.findOne(positionId);

    await this.db
      .delete(positionRisks)
      .where(
        and(
          eq(positionRisks.positionId, positionId),
          eq(positionRisks.riskId, riskId),
        ),
      );

    return this.getRisksForPosition(positionId);
  }

  async getPositionWithRisks(id: string) {
    const position = await this.findOne(id);
    const riskList = await this.getRisksForPosition(id);
    return { ...position, risks: riskList };
  }
}
