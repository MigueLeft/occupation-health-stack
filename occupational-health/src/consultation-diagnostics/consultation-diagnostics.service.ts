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
  consultationDiagnostics,
  ConsultationDiagnostic,
} from './consultation-diagnostics.schema';
import { consultations } from '../consultations/consultations.schema';
import { diseaseCategories } from '../disease-categories/disease-categories.schema';
import { diseases } from '../diseases/diseases.schema';
import { bodySystems } from '../body-systems/body-systems.schema';
import { CreateConsultationDiagnosticDto } from './dto/create-consultation-diagnostic.dto';
import { UpdateConsultationDiagnosticDto } from './dto/update-consultation-diagnostic.dto';

@Injectable()
export class ConsultationDiagnosticsService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findAll(consultationId?: string): Promise<ConsultationDiagnostic[]> {
    if (consultationId) {
      return this.db
        .select()
        .from(consultationDiagnostics)
        .where(eq(consultationDiagnostics.consultationId, consultationId));
    }
    return this.db.select().from(consultationDiagnostics);
  }

  async findOne(id: string): Promise<ConsultationDiagnostic> {
    const [diagnostic] = await this.db
      .select()
      .from(consultationDiagnostics)
      .where(eq(consultationDiagnostics.id, id));

    if (!diagnostic) {
      throw new NotFoundException(
        `No se encontró ningún diagnóstico con el ID "${id}".`,
      );
    }
    return diagnostic;
  }

  async create(
    dto: CreateConsultationDiagnosticDto,
  ): Promise<ConsultationDiagnostic> {
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

    // Verificar que la categoría de diagnóstico existe
    const [category] = await this.db
      .select()
      .from(diseaseCategories)
      .where(eq(diseaseCategories.id, dto.categoryId));

    if (!category) {
      throw new BadRequestException(
        `No existe ninguna categoría de diagnóstico con el ID "${dto.categoryId}".`,
      );
    }

    // Verificar que la enfermedad existe
    const [disease] = await this.db
      .select()
      .from(diseases)
      .where(eq(diseases.id, dto.diseaseId));

    if (!disease) {
      throw new BadRequestException(
        `No existe ninguna enfermedad con el ID "${dto.diseaseId}".`,
      );
    }

    // Verificar que el aparato/sistema existe (si fue enviado)
    if (dto.bodySystemId) {
      const [system] = await this.db
        .select()
        .from(bodySystems)
        .where(eq(bodySystems.id, dto.bodySystemId));

      if (!system) {
        throw new BadRequestException(
          `No existe ningún aparato/sistema con el ID "${dto.bodySystemId}".`,
        );
      }
    }

    const [created] = await this.db
      .insert(consultationDiagnostics)
      .values(dto)
      .returning();

    return created;
  }

  async update(
    id: string,
    dto: UpdateConsultationDiagnosticDto,
  ): Promise<ConsultationDiagnostic> {
    await this.findOne(id);

    // Verificar que la nueva categoría existe (si se actualiza)
    if (dto.categoryId) {
      const [category] = await this.db
        .select()
        .from(diseaseCategories)
        .where(eq(diseaseCategories.id, dto.categoryId));

      if (!category) {
        throw new BadRequestException(
          `No existe ninguna categoría de diagnóstico con el ID "${dto.categoryId}".`,
        );
      }
    }

    // Verificar que la nueva enfermedad existe (si se actualiza)
    if (dto.diseaseId) {
      const [disease] = await this.db
        .select()
        .from(diseases)
        .where(eq(diseases.id, dto.diseaseId));

      if (!disease) {
        throw new BadRequestException(
          `No existe ninguna enfermedad con el ID "${dto.diseaseId}".`,
        );
      }
    }

    // Verificar que el nuevo aparato/sistema existe (si se actualiza)
    if (dto.bodySystemId) {
      const [system] = await this.db
        .select()
        .from(bodySystems)
        .where(eq(bodySystems.id, dto.bodySystemId));

      if (!system) {
        throw new BadRequestException(
          `No existe ningún aparato/sistema con el ID "${dto.bodySystemId}".`,
        );
      }
    }

    const [updated] = await this.db
      .update(consultationDiagnostics)
      .set(dto)
      .where(eq(consultationDiagnostics.id, id))
      .returning();

    return updated;
  }

  async remove(id: string): Promise<ConsultationDiagnostic> {
    await this.findOne(id);

    const [deleted] = await this.db
      .delete(consultationDiagnostics)
      .where(eq(consultationDiagnostics.id, id))
      .returning();

    return deleted;
  }
}
