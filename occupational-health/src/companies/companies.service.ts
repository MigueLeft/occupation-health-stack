import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { eq, count } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { companies, Company } from './companies.schema';
import { positions } from '../positions/positions.schema';
import { patients } from '../patients/patients.schema';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async findAll() {
    const result = await this.db.select().from(companies);

    // Cuenta empleados por cargo para calcular employeeCount
    const employeeCounts = await this.db
      .select({ positionId: patients.positionId, total: count() })
      .from(patients)
      .groupBy(patients.positionId);

    const countMap = new Map(
      employeeCounts.map((r) => [r.positionId, Number(r.total)]),
    );

    const companiesWithPositions = await Promise.all(
      result.map(async (company) => {
        const companyPositions = await this.db
          .select()
          .from(positions)
          .where(eq(positions.companyId, company.id));

        return {
          ...company,
          positions: companyPositions.map((p) => ({
            ...p,
            employeeCount: countMap.get(p.id) ?? 0,
          })),
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

    // Obtiene los cargos de la empresa
    const companyPositions = await this.db
      .select()
      .from(positions)
      .where(eq(positions.companyId, id));

    return { ...company, positions: companyPositions };
  }

  async create(dto: CreateCompanyDto) {
    // Verificar que el RIF no esté ya registrado
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

    // Si se intenta cambiar el RIF, verificar que no exista otro con ese RIF
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

    const [deleted] = await this.db
      .delete(companies)
      .where(eq(companies.id, id))
      .returning();

    return deleted;
  }
}
