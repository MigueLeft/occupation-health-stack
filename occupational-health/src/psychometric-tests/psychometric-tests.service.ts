import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import {
  psychometricTests,
  PsychometricTest,
} from './psychometric-tests.schema';
import { psychometricTestCatalog } from '../psychometric-test-catalog/psychometric-test-catalog.schema';
import { consultations } from '../consultations/consultations.schema';
import { CreatePsychometricTestDto } from './dto/create-psychometric-test.dto';
import { UpdatePsychometricTestDto } from './dto/update-psychometric-test.dto';

@Injectable()
export class PsychometricTestsService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findAll(consultationId?: string): Promise<PsychometricTest[]> {
    if (consultationId) {
      return this.db
        .select()
        .from(psychometricTests)
        .where(eq(psychometricTests.consultationId, consultationId));
    }
    return this.db.select().from(psychometricTests);
  }

  async findOne(id: string): Promise<PsychometricTest> {
    const [test] = await this.db
      .select()
      .from(psychometricTests)
      .where(eq(psychometricTests.id, id));

    if (!test) {
      throw new NotFoundException(
        `No se encontró ningún test psicométrico con el ID "${id}".`,
      );
    }
    return test;
  }

  async create(dto: CreatePsychometricTestDto): Promise<PsychometricTest> {
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

    // Verificar que el test del catálogo existe
    const [catalogTest] = await this.db
      .select()
      .from(psychometricTestCatalog)
      .where(eq(psychometricTestCatalog.id, dto.catalogTestId));

    if (!catalogTest) {
      throw new BadRequestException(
        `No existe ningún test psicométrico en el catálogo con el ID "${dto.catalogTestId}".`,
      );
    }

    // Solo validar interpretación si fue provista
    if (
      dto.selectedInterpretation &&
      !catalogTest.interpretations.includes(dto.selectedInterpretation)
    ) {
      throw new BadRequestException(
        `La interpretación "${dto.selectedInterpretation}" no es válida para el test "${catalogTest.name}". ` +
          `Las interpretaciones disponibles son: ${catalogTest.interpretations.join(', ')}.`,
      );
    }

    const [created] = await this.db
      .insert(psychometricTests)
      .values({
        consultationId: dto.consultationId,
        catalogTestId: dto.catalogTestId,
        selectedInterpretation: dto.selectedInterpretation ?? '',
        observations: dto.observations,
      })
      .returning();

    return created;
  }

  async update(
    id: string,
    dto: UpdatePsychometricTestDto,
  ): Promise<PsychometricTest> {
    const existing = await this.findOne(id);

    // Si se cambia el catalogTestId o la interpretación, revalidar
    const catalogTestId = dto.catalogTestId ?? existing.catalogTestId;
    const selectedInterpretation =
      dto.selectedInterpretation ?? existing.selectedInterpretation;

    if (dto.catalogTestId || dto.selectedInterpretation) {
      const [catalogTest] = await this.db
        .select()
        .from(psychometricTestCatalog)
        .where(eq(psychometricTestCatalog.id, catalogTestId));

      if (!catalogTest) {
        throw new BadRequestException(
          `No existe ningún test psicométrico en el catálogo con el ID "${catalogTestId}".`,
        );
      }

      if (
        selectedInterpretation &&
        !catalogTest.interpretations.includes(selectedInterpretation)
      ) {
        throw new BadRequestException(
          `La interpretación "${selectedInterpretation}" no es válida para el test "${catalogTest.name}". ` +
            `Las interpretaciones disponibles son: ${catalogTest.interpretations.join(', ')}.`,
        );
      }
    }

    const [updated] = await this.db
      .update(psychometricTests)
      .set({
        ...(dto.catalogTestId && { catalogTestId: dto.catalogTestId }),
        ...(dto.selectedInterpretation !== undefined && {
          selectedInterpretation: dto.selectedInterpretation,
        }),
        ...(dto.observations !== undefined && {
          observations: dto.observations,
        }),
      })
      .where(eq(psychometricTests.id, id))
      .returning();

    return updated;
  }

  async remove(id: string): Promise<PsychometricTest> {
    await this.findOne(id);

    const [deleted] = await this.db
      .delete(psychometricTests)
      .where(eq(psychometricTests.id, id))
      .returning();

    return deleted;
  }
}
