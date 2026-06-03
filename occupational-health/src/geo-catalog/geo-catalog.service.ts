import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { eq, and, or } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { geoLocations, GeoLocation } from './geo-catalog.schema';
import { companies } from '../companies/companies.schema';
import { CreateGeoLocationDto } from './dto/create-geo-location.dto';
import { UpdateGeoLocationDto } from './dto/update-geo-location.dto';

@Injectable()
export class GeoCatalogService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findAll(type?: string): Promise<GeoLocation[]> {
    if (type) {
      return this.db
        .select()
        .from(geoLocations)
        .where(eq(geoLocations.type, type));
    }
    return this.db.select().from(geoLocations);
  }

  async findOne(id: string): Promise<GeoLocation> {
    const [location] = await this.db
      .select()
      .from(geoLocations)
      .where(eq(geoLocations.id, id));

    if (!location) {
      throw new NotFoundException(
        `No se encontró ninguna ubicación geográfica con el ID "${id}".`,
      );
    }
    return location;
  }

  async create(dto: CreateGeoLocationDto): Promise<GeoLocation> {
    const [existing] = await this.db
      .select()
      .from(geoLocations)
      .where(
        and(eq(geoLocations.name, dto.name), eq(geoLocations.type, dto.type)),
      );

    if (existing) {
      throw new ConflictException(
        `Ya existe un(a) ${dto.type} con el nombre "${dto.name}".`,
      );
    }

    const [created] = await this.db
      .insert(geoLocations)
      .values(dto)
      .returning();
    return created;
  }

  async update(id: string, dto: UpdateGeoLocationDto): Promise<GeoLocation> {
    await this.findOne(id);

    const [updated] = await this.db
      .update(geoLocations)
      .set(dto)
      .where(eq(geoLocations.id, id))
      .returning();

    return updated;
  }

  async remove(id: string): Promise<GeoLocation> {
    await this.findOne(id);

    const [linkedCompany] = await this.db
      .select({ id: companies.id })
      .from(companies)
      .where(
        or(
          eq(companies.stateId, id),
          eq(companies.cityId, id),
          eq(companies.municipalityId, id),
          eq(companies.parishId, id),
        ),
      )
      .limit(1);

    if (linkedCompany) {
      throw new ConflictException(
        'No se puede eliminar esta ubicación geográfica porque está siendo utilizada por una o más empresas. Reasigne o actualice las empresas relacionadas primero.',
      );
    }

    const [deleted] = await this.db
      .delete(geoLocations)
      .where(eq(geoLocations.id, id))
      .returning();

    return deleted;
  }
}
