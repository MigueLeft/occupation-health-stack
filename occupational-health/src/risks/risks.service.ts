import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { risks, Risk } from './risks.schema';
import { positionRisks } from '../positions/positions.schema';
import { CreateRiskDto } from './dto/create-risk.dto';
import { UpdateRiskDto } from './dto/update-risk.dto';

@Injectable()
export class RisksService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findAll(type?: string): Promise<Risk[]> {
    // Permite filtrar el catálogo por tipo de riesgo
    if (type) {
      return this.db.select().from(risks).where(eq(risks.type, type));
    }
    return this.db.select().from(risks);
  }

  async findOne(id: string): Promise<Risk> {
    const [risk] = await this.db.select().from(risks).where(eq(risks.id, id));

    if (!risk) {
      throw new NotFoundException(
        `No se encontró ningún riesgo con el ID "${id}".`,
      );
    }
    return risk;
  }

  async create(dto: CreateRiskDto): Promise<Risk> {
    // Verificar que no exista un riesgo con el mismo nombre
    const [existing] = await this.db
      .select()
      .from(risks)
      .where(eq(risks.name, dto.name));

    if (existing) {
      throw new ConflictException(
        `Ya existe un riesgo con el nombre "${dto.name}" en el catálogo.`,
      );
    }

    const [created] = await this.db.insert(risks).values(dto).returning();
    return created;
  }

  async update(id: string, dto: UpdateRiskDto): Promise<Risk> {
    await this.findOne(id);

    const [updated] = await this.db
      .update(risks)
      .set(dto)
      .where(eq(risks.id, id))
      .returning();

    return updated;
  }

  async remove(id: string): Promise<Risk> {
    await this.findOne(id);

    const [inUse] = await this.db
      .select()
      .from(positionRisks)
      .where(eq(positionRisks.riskId, id))
      .limit(1);

    if (inUse) {
      throw new ConflictException(
        'No se puede eliminar este riesgo porque está asociado a uno o más cargos.',
      );
    }

    const [deleted] = await this.db
      .delete(risks)
      .where(eq(risks.id, id))
      .returning();

    return deleted;
  }
}
