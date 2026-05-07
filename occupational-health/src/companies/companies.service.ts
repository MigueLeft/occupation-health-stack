import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { eq, count, and, isNull } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { companies, Company } from './companies.schema';
import { positions, positionRisks } from '../positions/positions.schema';
import { risks } from '../risks/risks.schema';
import { patients } from '../patients/patients.schema';
import { geoLocations } from '../geo-catalog/geo-catalog.schema';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  private async getRisksForPosition(positionId: string) {
    const rows = await this.db
      .select({ id: risks.id, name: risks.name, type: risks.type })
      .from(positionRisks)
      .innerJoin(risks, eq(positionRisks.riskId, risks.id))
      .where(
        and(
          eq(positionRisks.positionId, positionId),
          isNull(positionRisks.removedAt),
        ),
      );
    return rows.sort((a, b) => a.type.localeCompare(b.type));
  }

  private async resolveGeoNames(company: Company) {
    const ids = [
      company.stateId,
      company.cityId,
      company.municipalityId,
      company.parishId,
    ].filter(Boolean) as string[];

    if (ids.length === 0) return company;

    const geoList = await this.db
      .select()
      .from(geoLocations)
      .where(
        ids.length === 1
          ? eq(geoLocations.id, ids[0])
          : eq(geoLocations.id, ids[0]),
      );

    // Resuelve los nombres de las ubicaciones geográficas
    const geoMap = new Map(geoList.map((g) => [g.id, g.name]));
    return {
      ...company,
      stateName: company.stateId ? (geoMap.get(company.stateId) ?? null) : null,
      cityName: company.cityId ? (geoMap.get(company.cityId) ?? null) : null,
      municipalityName: company.municipalityId
        ? (geoMap.get(company.municipalityId) ?? null)
        : null,
      parishName: company.parishId
        ? (geoMap.get(company.parishId) ?? null)
        : null,
    };
  }

  async findAll() {
    const result = await this.db.select().from(companies);

    const employeeCounts = await this.db
      .select({ positionId: patients.positionId, total: count() })
      .from(patients)
      .groupBy(patients.positionId);

    const countMap = new Map(
      employeeCounts.map((r) => [r.positionId, Number(r.total)]),
    );

    // Obtiene todos los geo locations de una sola vez para optimizar
    const allGeoLocations = await this.db.select().from(geoLocations);
    const geoMap = new Map(allGeoLocations.map((g) => [g.id, g.name]));

    const companiesWithPositions = await Promise.all(
      result.map(async (company) => {
        const companyPositions = await this.db
          .select()
          .from(positions)
          .where(eq(positions.companyId, company.id));

        return {
          ...company,
          stateName: company.stateId ? (geoMap.get(company.stateId) ?? null) : null,
          cityName: company.cityId ? (geoMap.get(company.cityId) ?? null) : null,
          municipalityName: company.municipalityId
            ? (geoMap.get(company.municipalityId) ?? null)
            : null,
          parishName: company.parishId
            ? (geoMap.get(company.parishId) ?? null)
            : null,
          positions: await Promise.all(
            companyPositions.map(async (p) => ({
              ...p,
              employeeCount: countMap.get(p.id) ?? 0,
              risks: await this.getRisksForPosition(p.id),
            })),
          ),
        };
      }),
    );

    return companiesWithPositions;
  }

  async findOne(id: string) {
    const [company] = await this.db
      .select()
      .from(companies)
      .where(eq(companies.id, id));

    if (!company) {
      throw new NotFoundException(
        `No se encontró ninguna empresa con el ID "${id}".`,
      );
    }

    const companyPositions = await this.db
      .select()
      .from(positions)
      .where(eq(positions.companyId, id));

    const allGeoLocations = await this.db.select().from(geoLocations);
    const geoMap = new Map(allGeoLocations.map((g) => [g.id, g.name]));

    return {
      ...company,
      stateName: company.stateId ? (geoMap.get(company.stateId) ?? null) : null,
      cityName: company.cityId ? (geoMap.get(company.cityId) ?? null) : null,
      municipalityName: company.municipalityId
        ? (geoMap.get(company.municipalityId) ?? null)
        : null,
      parishName: company.parishId
        ? (geoMap.get(company.parishId) ?? null)
        : null,
      positions: await Promise.all(
        companyPositions.map(async (p) => ({
          ...p,
          risks: await this.getRisksForPosition(p.id),
        })),
      ),
    };
  }

  async create(dto: CreateCompanyDto) {
    const [existing] = await this.db
      .select()
      .from(companies)
      .where(eq(companies.rif, dto.rif));

    if (existing) {
      throw new ConflictException(
        `Ya existe una empresa con el RIF "${dto.rif}". Cada empresa debe tener un RIF único.`,
      );
    }

    const [created] = await this.db.insert(companies).values(dto).returning();
    return { ...created, positions: [] };
  }

  async update(id: string, dto: UpdateCompanyDto): Promise<Company> {
    await this.findOne(id);

    if (dto.rif) {
      const [existing] = await this.db
        .select()
        .from(companies)
        .where(eq(companies.rif, dto.rif));

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Ya existe otra empresa con el RIF "${dto.rif}".`,
        );
      }
    }

    const [updated] = await this.db
      .update(companies)
      .set(dto)
      .where(eq(companies.id, id))
      .returning();

    return updated;
  }

  async remove(id: string): Promise<Company> {
    await this.findOne(id);

    const [linkedPatient] = await this.db
      .select({ cedula: patients.cedula })
      .from(patients)
      .where(eq(patients.companyId, id))
      .limit(1);

    if (linkedPatient) {
      throw new ConflictException(
        'No se puede eliminar esta empresa porque tiene pacientes asociados. Reasigne o elimine los pacientes primero.',
      );
    }

    const [deleted] = await this.db
      .delete(companies)
      .where(eq(companies.id, id))
      .returning();

    return deleted;
  }
}
