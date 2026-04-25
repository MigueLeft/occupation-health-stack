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
  diseaseCategories,
  DiseaseCategory,
} from './disease-categories.schema';
import { CreateDiseaseCategoryDto } from './dto/create-disease-category.dto';
import { UpdateDiseaseCategoryDto } from './dto/update-disease-category.dto';

@Injectable()
export class DiseaseCategoriesService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findAll(): Promise<DiseaseCategory[]> {
    return this.db.select().from(diseaseCategories);
  }

  async findOne(id: string): Promise<DiseaseCategory> {
    const [category] = await this.db
      .select()
      .from(diseaseCategories)
      .where(eq(diseaseCategories.id, id));

    if (!category) {
      throw new NotFoundException(
        `No se encontró ninguna categoría de diagnóstico con el ID "${id}".`,
      );
    }
    return category;
  }

  async create(dto: CreateDiseaseCategoryDto): Promise<DiseaseCategory> {
    const [existing] = await this.db
      .select()
      .from(diseaseCategories)
      .where(eq(diseaseCategories.name, dto.name));

    if (existing) {
      throw new ConflictException(
        `Ya existe una categoría de diagnóstico con el nombre "${dto.name}".`,
      );
    }

    const [created] = await this.db
      .insert(diseaseCategories)
      .values({ name: dto.name })
      .returning();

    return created;
  }

  async update(
    id: string,
    dto: UpdateDiseaseCategoryDto,
  ): Promise<DiseaseCategory> {
    await this.findOne(id);

    if (dto.name) {
      const [existing] = await this.db
        .select()
        .from(diseaseCategories)
        .where(eq(diseaseCategories.name, dto.name));

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Ya existe otra categoría de diagnóstico con el nombre "${dto.name}".`,
        );
      }
    }

    const [updated] = await this.db
      .update(diseaseCategories)
      .set(dto)
      .where(eq(diseaseCategories.id, id))
      .returning();

    return updated;
  }

  async remove(id: string): Promise<DiseaseCategory> {
    await this.findOne(id);

    const [deleted] = await this.db
      .delete(diseaseCategories)
      .where(eq(diseaseCategories.id, id))
      .returning();

    return deleted;
  }
}
