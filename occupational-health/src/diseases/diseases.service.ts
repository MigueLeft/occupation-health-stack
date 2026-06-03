import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { eq, count } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { diseases, Disease } from './diseases.schema';
import { patientDiseases } from '../patients/patients.schema';
import { CreateDiseaseDto } from './dto/create-disease.dto';
import { UpdateDiseaseDto } from './dto/update-disease.dto';

@Injectable()
export class DiseasesService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findAll(): Promise<Disease[]> {
    return this.db.select().from(diseases);
  }

  async findOne(id: string): Promise<Disease> {
    const [disease] = await this.db
      .select()
      .from(diseases)
      .where(eq(diseases.id, id));

    if (!disease) {
      throw new NotFoundException(
        `No se encontró ninguna enfermedad con el ID "${id}".`,
      );
    }
    return disease;
  }

  async create(dto: CreateDiseaseDto): Promise<Disease> {
    // Verificar que no exista una enfermedad con el mismo nombre
    const [existing] = await this.db
      .select()
      .from(diseases)
      .where(eq(diseases.name, dto.name));

    if (existing) {
      throw new ConflictException(
        `Ya existe una enfermedad con el nombre "${dto.name}".`,
      );
    }

    const [created] = await this.db
      .insert(diseases)
      .values({ name: dto.name, isChronic: dto.isChronic ?? false })
      .returning();

    return created;
  }

  async update(id: string, dto: UpdateDiseaseDto): Promise<Disease> {
    await this.findOne(id);

    // Verificar nombre duplicado si se está cambiando
    if (dto.name) {
      const [existing] = await this.db
        .select()
        .from(diseases)
        .where(eq(diseases.name, dto.name));

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Ya existe otra enfermedad con el nombre "${dto.name}".`,
        );
      }
    }

    const [updated] = await this.db
      .update(diseases)
      .set(dto)
      .where(eq(diseases.id, id))
      .returning();

    return updated;
  }

  async remove(id: string): Promise<Disease> {
    const disease = await this.findOne(id);

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(patientDiseases)
      .where(eq(patientDiseases.diseaseId, id));

    if (total > 0) {
      throw new ConflictException(
        `No se puede eliminar la enfermedad "${disease.name}" porque está registrada en ${total} paciente(s).`,
      );
    }

    const [deleted] = await this.db
      .delete(diseases)
      .where(eq(diseases.id, id))
      .returning();

    return deleted;
  }
}
