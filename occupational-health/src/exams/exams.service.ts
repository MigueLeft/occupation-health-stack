import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { exams, Exam } from './exams.schema';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

@Injectable()
export class ExamsService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findAll(category?: string): Promise<Exam[]> {
    // Permite filtrar el catálogo por categoría
    if (category) {
      return this.db.select().from(exams).where(eq(exams.category, category));
    }
    return this.db.select().from(exams);
  }

  async findOne(id: string): Promise<Exam> {
    const [exam] = await this.db.select().from(exams).where(eq(exams.id, id));

    if (!exam) {
      throw new NotFoundException(
        `No se encontró ningún examen con el ID "${id}".`,
      );
    }
    return exam;
  }

  async create(dto: CreateExamDto): Promise<Exam> {
    // Verificar que no exista un examen con el mismo nombre
    const [existing] = await this.db
      .select()
      .from(exams)
      .where(eq(exams.name, dto.name));

    if (existing) {
      throw new ConflictException(
        `Ya existe un examen con el nombre "${dto.name}" en el catálogo.`,
      );
    }

    const [created] = await this.db.insert(exams).values(dto).returning();
    return created;
  }

  async update(id: string, dto: UpdateExamDto): Promise<Exam> {
    await this.findOne(id);

    const [updated] = await this.db
      .update(exams)
      .set(dto)
      .where(eq(exams.id, id))
      .returning();

    return updated;
  }

  async remove(id: string): Promise<Exam> {
    await this.findOne(id);

    const [deleted] = await this.db
      .delete(exams)
      .where(eq(exams.id, id))
      .returning();

    return deleted;
  }
}
