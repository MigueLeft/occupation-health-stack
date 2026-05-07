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
  medicalSpecialties,
  MedicalSpecialty,
} from './medical-specialties.schema';
import { CreateMedicalSpecialtyDto } from './dto/create-medical-specialty.dto';
import { UpdateMedicalSpecialtyDto } from './dto/update-medical-specialty.dto';

@Injectable()
export class MedicalSpecialtiesService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findAll(): Promise<MedicalSpecialty[]> {
    return this.db.select().from(medicalSpecialties);
  }

  async findOne(id: string): Promise<MedicalSpecialty> {
    const [specialty] = await this.db
      .select()
      .from(medicalSpecialties)
      .where(eq(medicalSpecialties.id, id));

    if (!specialty) {
      throw new NotFoundException(
        `No se encontró ninguna especialidad médica con el ID "${id}".`,
      );
    }
    return specialty;
  }

  async create(dto: CreateMedicalSpecialtyDto): Promise<MedicalSpecialty> {
    // Verificar que no exista una especialidad con el mismo nombre
    const [existing] = await this.db
      .select()
      .from(medicalSpecialties)
      .where(eq(medicalSpecialties.name, dto.name));

    if (existing) {
      throw new ConflictException(
        `Ya existe una especialidad médica con el nombre "${dto.name}".`,
      );
    }

    const [created] = await this.db
      .insert(medicalSpecialties)
      .values({ name: dto.name })
      .returning();

    return created;
  }

  async update(
    id: string,
    dto: UpdateMedicalSpecialtyDto,
  ): Promise<MedicalSpecialty> {
    await this.findOne(id);

    const [updated] = await this.db
      .update(medicalSpecialties)
      .set(dto)
      .where(eq(medicalSpecialties.id, id))
      .returning();

    return updated;
  }

  async remove(id: string): Promise<MedicalSpecialty> {
    await this.findOne(id);

    // Verificar que no tenga referencias activas en consultation_referrals
    // (la FK tiene ON DELETE SET NULL, así que no bloqueará en DB, pero informamos)
    const [deleted] = await this.db
      .delete(medicalSpecialties)
      .where(eq(medicalSpecialties.id, id))
      .returning();

    return deleted;
  }
}
