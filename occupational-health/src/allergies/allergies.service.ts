import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { eq, count } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { allergies, Allergy } from './allergies.schema';
import { patientAllergies } from '../patients/patients.schema';
import { CreateAllergyDto } from './dto/create-allergy.dto';
import { UpdateAllergyDto } from './dto/update-allergy.dto';

@Injectable()
export class AllergiesService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findAll(): Promise<Allergy[]> {
    return this.db.select().from(allergies);
  }

  async findOne(id: string): Promise<Allergy> {
    const [allergy] = await this.db
      .select()
      .from(allergies)
      .where(eq(allergies.id, id));

    if (!allergy) {
      throw new NotFoundException(
        `No se encontró ninguna alergia con el ID "${id}".`,
      );
    }
    return allergy;
  }

  async create(dto: CreateAllergyDto): Promise<Allergy> {
    const [existing] = await this.db
      .select()
      .from(allergies)
      .where(eq(allergies.name, dto.name));

    if (existing) {
      throw new ConflictException(
        `Ya existe una alergia con el nombre "${dto.name}".`,
      );
    }

    const [created] = await this.db
      .insert(allergies)
      .values({ name: dto.name })
      .returning();

    return created;
  }

  async update(id: string, dto: UpdateAllergyDto): Promise<Allergy> {
    await this.findOne(id);

    const [updated] = await this.db
      .update(allergies)
      .set(dto)
      .where(eq(allergies.id, id))
      .returning();

    return updated;
  }

  async remove(id: string): Promise<Allergy> {
    const allergy = await this.findOne(id);

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(patientAllergies)
      .where(eq(patientAllergies.allergyId, id));

    if (total > 0) {
      throw new ConflictException(
        `No se puede eliminar la alergia "${allergy.name}" porque está asignada a ${total} paciente(s).`,
      );
    }

    const [deleted] = await this.db
      .delete(allergies)
      .where(eq(allergies.id, id))
      .returning();

    return deleted;
  }
}
