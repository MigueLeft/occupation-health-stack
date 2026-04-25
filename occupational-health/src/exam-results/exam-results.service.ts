import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { examResults, ExamResult } from './exam-results.schema';
import { consultations } from '../consultations/consultations.schema';
import { exams } from '../exams/exams.schema';
import { CreateExamResultDto } from './dto/create-exam-result.dto';
import { UpdateExamResultDto } from './dto/update-exam-result.dto';

@Injectable()
export class ExamResultsService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findAll(consultationId?: string): Promise<ExamResult[]> {
    // Permite filtrar los resultados por consulta
    if (consultationId) {
      return this.db
        .select()
        .from(examResults)
        .where(eq(examResults.consultationId, consultationId));
    }
    return this.db.select().from(examResults);
  }

  async findOne(id: string): Promise<ExamResult> {
    const [examResult] = await this.db
      .select()
      .from(examResults)
      .where(eq(examResults.id, id));

    if (!examResult) {
      throw new NotFoundException(
        `No se encontró ningún resultado de examen con el ID "${id}".`,
      );
    }
    return examResult;
  }

  async create(dto: CreateExamResultDto): Promise<ExamResult> {
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

    // Verificar que el examen del catálogo existe
    const [exam] = await this.db
      .select()
      .from(exams)
      .where(eq(exams.id, dto.examId));

    if (!exam) {
      throw new BadRequestException(
        `No existe ningún examen en el catálogo con el ID "${dto.examId}". ` +
          `Registre el examen en el catálogo antes de agregar resultados.`,
      );
    }

    const [created] = await this.db.insert(examResults).values(dto).returning();

    return created;
  }

  async update(id: string, dto: UpdateExamResultDto): Promise<ExamResult> {
    await this.findOne(id);

    const [updated] = await this.db
      .update(examResults)
      .set(dto)
      .where(eq(examResults.id, id))
      .returning();

    return updated;
  }

  async remove(id: string): Promise<ExamResult> {
    await this.findOne(id);

    const [deleted] = await this.db
      .delete(examResults)
      .where(eq(examResults.id, id))
      .returning();

    return deleted;
  }
}
