import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { eq, and, count } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import {
  psychologicalIndicators,
  psychologicalIndicatorValues,
  consultationPsychologicalResults,
  PsychologicalIndicator,
  PsychologicalIndicatorValue,
} from './psychological-indicators.schema';
import { CreatePsychologicalIndicatorDto } from './dto/create-psychological-indicator.dto';
import { UpdatePsychologicalIndicatorDto } from './dto/update-psychological-indicator.dto';
import { CreateIndicatorValueDto } from './dto/create-indicator-value.dto';
import { UpdateIndicatorValueDto } from './dto/update-indicator-value.dto';

@Injectable()
export class PsychologicalIndicatorsService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findAll(): Promise<
    Array<{
      id: string;
      name: string;
      sortOrder: number;
      values: Array<{ id: string; name: string; sortOrder: number }>;
    }>
  > {
    // Obtener indicadores activos ordenados por sortOrder
    const indicators = await this.db
      .select({
        id: psychologicalIndicators.id,
        name: psychologicalIndicators.name,
        sortOrder: psychologicalIndicators.sortOrder,
      })
      .from(psychologicalIndicators)
      .where(eq(psychologicalIndicators.isActive, true))
      .orderBy(psychologicalIndicators.sortOrder);

    if (indicators.length === 0) return [];

    // Obtener todos los valores activos de los indicadores encontrados
    const values = await this.db
      .select({
        id: psychologicalIndicatorValues.id,
        indicatorId: psychologicalIndicatorValues.indicatorId,
        name: psychologicalIndicatorValues.name,
        sortOrder: psychologicalIndicatorValues.sortOrder,
      })
      .from(psychologicalIndicatorValues)
      .where(eq(psychologicalIndicatorValues.isActive, true))
      .orderBy(psychologicalIndicatorValues.sortOrder);

    // Agrupar valores por indicador
    const valuesMap = new Map<
      string,
      Array<{ id: string; name: string; sortOrder: number }>
    >();
    for (const v of values) {
      if (!valuesMap.has(v.indicatorId)) {
        valuesMap.set(v.indicatorId, []);
      }
      valuesMap.get(v.indicatorId)!.push({
        id: v.id,
        name: v.name,
        sortOrder: v.sortOrder,
      });
    }

    return indicators.map((ind) => ({
      id: ind.id,
      name: ind.name,
      sortOrder: ind.sortOrder,
      values: valuesMap.get(ind.id) ?? [],
    }));
  }

  async createIndicator(
    dto: CreatePsychologicalIndicatorDto,
  ): Promise<PsychologicalIndicator> {
    // Verificar unicidad del nombre
    const [existing] = await this.db
      .select()
      .from(psychologicalIndicators)
      .where(eq(psychologicalIndicators.name, dto.name));

    if (existing) {
      throw new ConflictException(
        `Ya existe un indicador psicológico con el nombre "${dto.name}".`,
      );
    }

    const [created] = await this.db
      .insert(psychologicalIndicators)
      .values({
        name: dto.name,
        sortOrder: dto.sortOrder ?? 0,
      })
      .returning();

    return created;
  }

  async updateIndicator(
    id: string,
    dto: UpdatePsychologicalIndicatorDto,
  ): Promise<PsychologicalIndicator> {
    const [existing] = await this.db
      .select()
      .from(psychologicalIndicators)
      .where(eq(psychologicalIndicators.id, id));

    if (!existing) {
      throw new NotFoundException(
        `No se encontró ningún indicador psicológico con el ID "${id}".`,
      );
    }

    const updateData: Partial<typeof psychologicalIndicators.$inferInsert> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.sortOrder !== undefined) updateData.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    const [updated] = await this.db
      .update(psychologicalIndicators)
      .set(updateData)
      .where(eq(psychologicalIndicators.id, id))
      .returning();

    return updated;
  }

  async deleteIndicator(id: string): Promise<PsychologicalIndicator> {
    const [existing] = await this.db
      .select()
      .from(psychologicalIndicators)
      .where(eq(psychologicalIndicators.id, id));

    if (!existing) {
      throw new NotFoundException(
        `No se encontró ningún indicador psicológico con el ID "${id}".`,
      );
    }

    // Verificar si está referenciado en resultados de consultas
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(consultationPsychologicalResults)
      .where(eq(consultationPsychologicalResults.indicatorId, id));

    if (Number(total) > 0) {
      throw new ConflictException(
        `No se puede eliminar el indicador "${existing.name}" porque está referenciado en ${total} resultado(s) de consulta(s).`,
      );
    }

    const [deleted] = await this.db
      .delete(psychologicalIndicators)
      .where(eq(psychologicalIndicators.id, id))
      .returning();

    return deleted;
  }

  async createValue(
    indicatorId: string,
    dto: CreateIndicatorValueDto,
  ): Promise<PsychologicalIndicatorValue> {
    // Verificar que el indicador existe
    const [indicator] = await this.db
      .select()
      .from(psychologicalIndicators)
      .where(eq(psychologicalIndicators.id, indicatorId));

    if (!indicator) {
      throw new NotFoundException(
        `No se encontró ningún indicador psicológico con el ID "${indicatorId}".`,
      );
    }

    // Verificar unicidad del nombre dentro del mismo indicador
    const [existingValue] = await this.db
      .select()
      .from(psychologicalIndicatorValues)
      .where(
        and(
          eq(psychologicalIndicatorValues.indicatorId, indicatorId),
          eq(psychologicalIndicatorValues.name, dto.name),
        ),
      );

    if (existingValue) {
      throw new ConflictException(
        `Ya existe un valor con el nombre "${dto.name}" para el indicador "${indicator.name}".`,
      );
    }

    const [created] = await this.db
      .insert(psychologicalIndicatorValues)
      .values({
        indicatorId,
        name: dto.name,
        sortOrder: dto.sortOrder ?? 0,
      })
      .returning();

    return created;
  }

  async updateValue(
    indicatorId: string,
    valueId: string,
    dto: UpdateIndicatorValueDto,
  ): Promise<PsychologicalIndicatorValue> {
    // Verificar que el indicador existe
    const [indicator] = await this.db
      .select()
      .from(psychologicalIndicators)
      .where(eq(psychologicalIndicators.id, indicatorId));

    if (!indicator) {
      throw new NotFoundException(
        `No se encontró ningún indicador psicológico con el ID "${indicatorId}".`,
      );
    }

    // Verificar que el valor existe y pertenece al indicador
    const [existingValue] = await this.db
      .select()
      .from(psychologicalIndicatorValues)
      .where(
        and(
          eq(psychologicalIndicatorValues.id, valueId),
          eq(psychologicalIndicatorValues.indicatorId, indicatorId),
        ),
      );

    if (!existingValue) {
      throw new NotFoundException(
        `No se encontró ningún valor con el ID "${valueId}" para el indicador "${indicator.name}".`,
      );
    }

    const updateData: Partial<typeof psychologicalIndicatorValues.$inferInsert> =
      {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.sortOrder !== undefined) updateData.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    const [updated] = await this.db
      .update(psychologicalIndicatorValues)
      .set(updateData)
      .where(eq(psychologicalIndicatorValues.id, valueId))
      .returning();

    return updated;
  }

  async deleteValue(
    indicatorId: string,
    valueId: string,
  ): Promise<PsychologicalIndicatorValue> {
    // Verificar que el indicador existe
    const [indicator] = await this.db
      .select()
      .from(psychologicalIndicators)
      .where(eq(psychologicalIndicators.id, indicatorId));

    if (!indicator) {
      throw new NotFoundException(
        `No se encontró ningún indicador psicológico con el ID "${indicatorId}".`,
      );
    }

    // Verificar que el valor existe y pertenece al indicador
    const [existingValue] = await this.db
      .select()
      .from(psychologicalIndicatorValues)
      .where(
        and(
          eq(psychologicalIndicatorValues.id, valueId),
          eq(psychologicalIndicatorValues.indicatorId, indicatorId),
        ),
      );

    if (!existingValue) {
      throw new NotFoundException(
        `No se encontró ningún valor con el ID "${valueId}" para el indicador "${indicator.name}".`,
      );
    }

    // Verificar si está referenciado en resultados de consultas
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(consultationPsychologicalResults)
      .where(eq(consultationPsychologicalResults.valueId, valueId));

    if (Number(total) > 0) {
      throw new ConflictException(
        `No se puede eliminar el valor "${existingValue.name}" porque está referenciado en ${total} resultado(s) de consulta(s).`,
      );
    }

    const [deleted] = await this.db
      .delete(psychologicalIndicatorValues)
      .where(eq(psychologicalIndicatorValues.id, valueId))
      .returning();

    return deleted;
  }
}
