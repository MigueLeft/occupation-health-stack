import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { physicalExams, PhysicalExam } from './physical-exams.schema';
import { consultations } from '../consultations/consultations.schema';
import { CreatePhysicalExamDto } from './dto/create-physical-exam.dto';
import { UpdatePhysicalExamDto } from './dto/update-physical-exam.dto';

@Injectable()
export class PhysicalExamsService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findAll(consultationId?: string): Promise<PhysicalExam[]> {
    if (consultationId) {
      return this.db
        .select()
        .from(physicalExams)
        .where(eq(physicalExams.consultationId, consultationId));
    }
    return this.db.select().from(physicalExams);
  }

  async findOne(id: string): Promise<PhysicalExam> {
    const [exam] = await this.db
      .select()
      .from(physicalExams)
      .where(eq(physicalExams.id, id));

    if (!exam) {
      throw new NotFoundException(
        `No se encontró ningún examen físico con el ID "${id}".`,
      );
    }
    return exam;
  }

  async create(dto: CreatePhysicalExamDto): Promise<PhysicalExam> {
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

    // Una consulta solo puede tener un examen físico
    const [existing] = await this.db
      .select()
      .from(physicalExams)
      .where(eq(physicalExams.consultationId, dto.consultationId));

    if (existing) {
      throw new ConflictException(
        `La consulta "${dto.consultationId}" ya tiene un examen físico registrado. ` +
          `Use PATCH /${existing.id} para actualizar los valores existentes.`,
      );
    }

    const [created] = await this.db
      .insert(physicalExams)
      .values(dto)
      .returning();

    return created;
  }

  async update(id: string, dto: UpdatePhysicalExamDto): Promise<PhysicalExam> {
    await this.findOne(id);

    const [updated] = await this.db
      .update(physicalExams)
      .set(dto)
      .where(eq(physicalExams.id, id))
      .returning();

    return updated;
  }

  async remove(id: string): Promise<PhysicalExam> {
    await this.findOne(id);

    const [deleted] = await this.db
      .delete(physicalExams)
      .where(eq(physicalExams.id, id))
      .returning();

    return deleted;
  }
}
