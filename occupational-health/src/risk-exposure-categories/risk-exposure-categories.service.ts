import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import {
  riskExposureCategories,
  RiskExposureCategory,
} from './risk-exposure-categories.schema';
import { CreateRiskExposureCategoryDto } from './dto/create-risk-exposure-category.dto';
import { UpdateRiskExposureCategoryDto } from './dto/update-risk-exposure-category.dto';

@Injectable()
export class RiskExposureCategoriesService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findAll(): Promise<RiskExposureCategory[]> {
    return this.db.select().from(riskExposureCategories);
  }

  async findOne(id: string): Promise<RiskExposureCategory> {
    const [category] = await this.db
      .select()
      .from(riskExposureCategories)
      .where(eq(riskExposureCategories.id, id));

    if (!category) {
      throw new NotFoundException(
        `No se encontró ninguna categoría de exposición a riesgo con el ID "${id}".`,
      );
    }
    return category;
  }

  async create(
    dto: CreateRiskExposureCategoryDto,
  ): Promise<RiskExposureCategory> {
    // Verificar que no exista una categoría con el mismo tipo de riesgo
    const [existing] = await this.db
      .select()
      .from(riskExposureCategories)
      .where(eq(riskExposureCategories.riskType, dto.riskType));

    if (existing) {
      throw new ConflictException(
        `Ya existe una categoría de exposición para el tipo de riesgo "${dto.riskType}".`,
      );
    }

    const [created] = await this.db
      .insert(riskExposureCategories)
      .values({
        riskType: dto.riskType,
        name: dto.name,
        conditions: dto.conditions ?? null,
        healthEffects: dto.healthEffects ?? null,
      })
      .returning();

    return created;
  }

  async update(
    id: string,
    dto: UpdateRiskExposureCategoryDto,
  ): Promise<RiskExposureCategory> {
    await this.findOne(id);

    // Si se está actualizando el tipo de riesgo, verificar que no esté ya en uso
    if (dto.riskType) {
      const [conflict] = await this.db
        .select()
        .from(riskExposureCategories)
        .where(eq(riskExposureCategories.riskType, dto.riskType));

      if (conflict && conflict.id !== id) {
        throw new ConflictException(
          `Ya existe otra categoría con el tipo de riesgo "${dto.riskType}".`,
        );
      }
    }

    const [updated] = await this.db
      .update(riskExposureCategories)
      .set(dto)
      .where(eq(riskExposureCategories.id, id))
      .returning();

    return updated;
  }

  async remove(id: string): Promise<RiskExposureCategory> {
    await this.findOne(id);

    const [deleted] = await this.db
      .delete(riskExposureCategories)
      .where(eq(riskExposureCategories.id, id))
      .returning();

    return deleted;
  }
}
