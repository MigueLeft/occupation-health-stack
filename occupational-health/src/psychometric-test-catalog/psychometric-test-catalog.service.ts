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
  psychometricTestCatalog,
  PsychometricTestCatalog,
} from './psychometric-test-catalog.schema';
import { CreatePsychometricTestCatalogDto } from './dto/create-psychometric-test-catalog.dto';
import { UpdatePsychometricTestCatalogDto } from './dto/update-psychometric-test-catalog.dto';

@Injectable()
export class PsychometricTestCatalogService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findAll(): Promise<PsychometricTestCatalog[]> {
    return this.db.select().from(psychometricTestCatalog);
  }

  async findOne(id: string): Promise<PsychometricTestCatalog> {
    const [test] = await this.db
      .select()
      .from(psychometricTestCatalog)
      .where(eq(psychometricTestCatalog.id, id));

    if (!test) {
      throw new NotFoundException(
        `No se encontró ningún test psicométrico en el catálogo con el ID "${id}".`,
      );
    }
    return test;
  }

  async create(
    dto: CreatePsychometricTestCatalogDto,
  ): Promise<PsychometricTestCatalog> {
    const [existing] = await this.db
      .select()
      .from(psychometricTestCatalog)
      .where(eq(psychometricTestCatalog.name, dto.name));

    if (existing) {
      throw new ConflictException(
        `Ya existe un test psicométrico con el nombre "${dto.name}" en el catálogo.`,
      );
    }

    const [created] = await this.db
      .insert(psychometricTestCatalog)
      .values({ name: dto.name, interpretations: dto.interpretations })
      .returning();

    return created;
  }

  async update(
    id: string,
    dto: UpdatePsychometricTestCatalogDto,
  ): Promise<PsychometricTestCatalog> {
    await this.findOne(id);

    if (dto.name) {
      const [existing] = await this.db
        .select()
        .from(psychometricTestCatalog)
        .where(eq(psychometricTestCatalog.name, dto.name));

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Ya existe otro test psicométrico con el nombre "${dto.name}" en el catálogo.`,
        );
      }
    }

    const [updated] = await this.db
      .update(psychometricTestCatalog)
      .set(dto)
      .where(eq(psychometricTestCatalog.id, id))
      .returning();

    return updated;
  }

  async remove(id: string): Promise<PsychometricTestCatalog> {
    await this.findOne(id);

    const [deleted] = await this.db
      .delete(psychometricTestCatalog)
      .where(eq(psychometricTestCatalog.id, id))
      .returning();

    return deleted;
  }
}
