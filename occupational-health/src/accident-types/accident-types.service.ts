import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { eq, count } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { accidentTypes, AccidentType } from './accident-types.schema';
import { consultationDiagnostics } from '../consultation-diagnostics/consultation-diagnostics.schema';
import { CreateAccidentTypeDto } from './dto/create-accident-type.dto';
import { UpdateAccidentTypeDto } from './dto/update-accident-type.dto';

@Injectable()
export class AccidentTypesService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findAll(): Promise<AccidentType[]> {
    return this.db.select().from(accidentTypes);
  }

  async findOne(id: string): Promise<AccidentType> {
    const [accidentType] = await this.db
      .select()
      .from(accidentTypes)
      .where(eq(accidentTypes.id, id));

    if (!accidentType) {
      throw new NotFoundException(
        `No se encontró ningún tipo de accidente con el ID "${id}".`,
      );
    }
    return accidentType;
  }

  async create(dto: CreateAccidentTypeDto): Promise<AccidentType> {
    const [existing] = await this.db
      .select()
      .from(accidentTypes)
      .where(eq(accidentTypes.name, dto.name));

    if (existing) {
      throw new ConflictException(
        `Ya existe un tipo de accidente con el nombre "${dto.name}".`,
      );
    }

    const [created] = await this.db
      .insert(accidentTypes)
      .values({ name: dto.name })
      .returning();

    return created;
  }

  async update(id: string, dto: UpdateAccidentTypeDto): Promise<AccidentType> {
    await this.findOne(id);

    const [updated] = await this.db
      .update(accidentTypes)
      .set(dto)
      .where(eq(accidentTypes.id, id))
      .returning();

    return updated;
  }

  async remove(id: string): Promise<AccidentType> {
    const accidentType = await this.findOne(id);

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(consultationDiagnostics)
      .where(eq(consultationDiagnostics.accidentTypeId, id));

    if (total > 0) {
      throw new ConflictException(
        `No se puede eliminar el tipo de accidente "${accidentType.name}" porque está referenciado en ${total} diagnóstico(s).`,
      );
    }

    const [deleted] = await this.db
      .delete(accidentTypes)
      .where(eq(accidentTypes.id, id))
      .returning();

    return deleted;
  }
}
