import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { bodySystems, BodySystem } from './body-systems.schema';
import { CreateBodySystemDto } from './dto/create-body-system.dto';
import { UpdateBodySystemDto } from './dto/update-body-system.dto';

@Injectable()
export class BodySystemsService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findAll(): Promise<BodySystem[]> {
    return this.db.select().from(bodySystems);
  }

  async findOne(id: string): Promise<BodySystem> {
    const [system] = await this.db
      .select()
      .from(bodySystems)
      .where(eq(bodySystems.id, id));

    if (!system) {
      throw new NotFoundException(
        `No se encontró ningún aparato/sistema con el ID "${id}".`,
      );
    }
    return system;
  }

  async create(dto: CreateBodySystemDto): Promise<BodySystem> {
    const [existing] = await this.db
      .select()
      .from(bodySystems)
      .where(eq(bodySystems.name, dto.name));

    if (existing) {
      throw new ConflictException(
        `Ya existe un aparato/sistema con el nombre "${dto.name}".`,
      );
    }

    const [created] = await this.db
      .insert(bodySystems)
      .values({ name: dto.name })
      .returning();

    return created;
  }

  async update(id: string, dto: UpdateBodySystemDto): Promise<BodySystem> {
    await this.findOne(id);

    if (dto.name) {
      const [existing] = await this.db
        .select()
        .from(bodySystems)
        .where(eq(bodySystems.name, dto.name));

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Ya existe otro aparato/sistema con el nombre "${dto.name}".`,
        );
      }
    }

    const [updated] = await this.db
      .update(bodySystems)
      .set(dto)
      .where(eq(bodySystems.id, id))
      .returning();

    return updated;
  }

  async remove(id: string): Promise<BodySystem> {
    await this.findOne(id);

    const [deleted] = await this.db
      .delete(bodySystems)
      .where(eq(bodySystems.id, id))
      .returning();

    return deleted;
  }
}
