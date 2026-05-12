import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { disabilities, Disability } from './disabilities.schema';
import { CreateDisabilityDto } from './dto/create-disability.dto';
import { UpdateDisabilityDto } from './dto/update-disability.dto';

@Injectable()
export class DisabilitiesService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findAll(): Promise<Disability[]> {
    return this.db.select().from(disabilities).orderBy(disabilities.name);
  }

  async findOne(id: string): Promise<Disability> {
    const [disability] = await this.db
      .select()
      .from(disabilities)
      .where(eq(disabilities.id, id));

    if (!disability) {
      throw new NotFoundException(
        `No se encontró ninguna discapacidad con el ID "${id}".`,
      );
    }
    return disability;
  }

  async create(dto: CreateDisabilityDto): Promise<Disability> {
    const [existing] = await this.db
      .select()
      .from(disabilities)
      .where(eq(disabilities.name, dto.name));

    if (existing) {
      throw new ConflictException(
        `Ya existe una discapacidad con el nombre "${dto.name}".`,
      );
    }

    const [created] = await this.db
      .insert(disabilities)
      .values({ name: dto.name })
      .returning();

    return created;
  }

  async update(id: string, dto: UpdateDisabilityDto): Promise<Disability> {
    await this.findOne(id);

    const [updated] = await this.db
      .update(disabilities)
      .set(dto)
      .where(eq(disabilities.id, id))
      .returning();

    return updated;
  }

  async remove(id: string): Promise<Disability> {
    await this.findOne(id);

    const [deleted] = await this.db
      .delete(disabilities)
      .where(eq(disabilities.id, id))
      .returning();

    return deleted;
  }
}
