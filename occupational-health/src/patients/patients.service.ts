import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import {
  patients,
  patientAllergies,
  patientDiseases,
  Patient,
} from './patients.schema';
import { allergies } from '../allergies/allergies.schema';
import { diseases } from '../diseases/diseases.schema';
import { companies } from '../companies/companies.schema';
import { positions } from '../positions/positions.schema';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  // Construye el objeto completo del paciente con todas sus relaciones
  private async buildPatientResponse(cedula: string) {
    const [patient] = await this.db
      .select()
      .from(patients)
      .where(eq(patients.cedula, cedula));

    if (!patient) return null;

    // Obtiene empresa y cargo en paralelo (solo si los IDs están presentes)
    const [companyResult, positionResult] = await Promise.all([
      patient.companyId
        ? this.db.select().from(companies).where(eq(companies.id, patient.companyId))
        : Promise.resolve([]),
      patient.positionId
        ? this.db.select().from(positions).where(eq(positions.id, patient.positionId))
        : Promise.resolve([]),
    ]);
    const [company] = companyResult;
    const [position] = positionResult;

    // Obtiene las alergias del paciente
    const allergyLinks = await this.db
      .select()
      .from(patientAllergies)
      .where(eq(patientAllergies.patientId, cedula));

    const patientAllergyList =
      allergyLinks.length > 0
        ? await this.db
            .select()
            .from(allergies)
            .where(
              inArray(
                allergies.id,
                allergyLinks.map((a) => a.allergyId),
              ),
            )
        : [];

    // Obtiene las enfermedades del paciente
    const diseaseLinks = await this.db
      .select()
      .from(patientDiseases)
      .where(eq(patientDiseases.patientId, cedula));

    const patientDiseaseList =
      diseaseLinks.length > 0
        ? await this.db
            .select()
            .from(diseases)
            .where(
              inArray(
                diseases.id,
                diseaseLinks.map((d) => d.diseaseId),
              ),
            )
        : [];

    return {
      ...patient,
      company: company ?? null,
      position: position ?? null,
      allergies: patientAllergyList,
      diseases: patientDiseaseList,
    };
  }

  // Valida que una empresa y un cargo existan y que el cargo pertenezca a esa empresa
  private async validateCompanyAndPosition(
    companyId: string,
    positionId: string,
  ) {
    const [[company], [position]] = await Promise.all([
      this.db.select().from(companies).where(eq(companies.id, companyId)),
      this.db.select().from(positions).where(eq(positions.id, positionId)),
    ]);

    if (!company) {
      throw new BadRequestException(
        `No existe ninguna empresa con el ID "${companyId}".`,
      );
    }
    if (!position) {
      throw new BadRequestException(
        `No existe ningún cargo con el ID "${positionId}".`,
      );
    }
    if (position.companyId !== companyId) {
      throw new BadRequestException(
        `El cargo "${position.name}" no pertenece a la empresa seleccionada. ` +
          `Seleccione un cargo que esté registrado bajo esa empresa.`,
      );
    }
  }

  // Valida que los IDs de alergias existan en la base de datos
  private async validateAllergies(allergyIds: string[]) {
    if (allergyIds.length === 0) return;

    const found = await this.db
      .select()
      .from(allergies)
      .where(inArray(allergies.id, allergyIds));

    if (found.length !== allergyIds.length) {
      const foundIds = found.map((a) => a.id);
      const missing = allergyIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `Los siguientes IDs de alergia no existen: ${missing.join(', ')}.`,
      );
    }
  }

  // Valida que los IDs de enfermedades existan en la base de datos
  private async validateDiseases(diseaseIds: string[]) {
    if (diseaseIds.length === 0) return;

    const found = await this.db
      .select()
      .from(diseases)
      .where(inArray(diseases.id, diseaseIds));

    if (found.length !== diseaseIds.length) {
      const foundIds = found.map((d) => d.id);
      const missing = diseaseIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `Los siguientes IDs de enfermedad no existen: ${missing.join(', ')}.`,
      );
    }
  }

  async findAll() {
    const allPatients = await this.db.select().from(patients);

    return Promise.all(
      allPatients.map((p) => this.buildPatientResponse(p.cedula)),
    );
  }

  async findOne(cedula: string) {
    const patient = await this.buildPatientResponse(cedula);

    if (!patient) {
      throw new NotFoundException(
        `No se encontró ningún paciente con la cédula "${cedula}".`,
      );
    }
    return patient;
  }

  async create(dto: CreatePatientDto) {
    // Verificar que la cédula no esté ya registrada
    const [existing] = await this.db
      .select()
      .from(patients)
      .where(eq(patients.cedula, dto.cedula));

    if (existing) {
      throw new ConflictException(
        `Ya existe un paciente con la cédula "${dto.cedula}".`,
      );
    }

    // Verificar que el correo no esté ya registrado
    const [existingEmail] = await this.db
      .select()
      .from(patients)
      .where(eq(patients.email, dto.email));

    if (existingEmail) {
      throw new ConflictException(
        `Ya existe un paciente registrado con el correo "${dto.email}". Cada paciente debe tener un correo único.`,
      );
    }

    // Verificar empresa, cargo y que el cargo pertenezca a la empresa
    await this.validateCompanyAndPosition(dto.companyId, dto.positionId);

    // Validar alergias y enfermedades
    if (dto.allergyIds?.length) await this.validateAllergies(dto.allergyIds);
    if (dto.diseaseIds?.length) await this.validateDiseases(dto.diseaseIds);

    const { allergyIds, diseaseIds, ...patientData } = dto;

    // Insertar el paciente
    await this.db.insert(patients).values(patientData);

    // Insertar alergias en la tabla intermedia
    if (allergyIds?.length) {
      await this.db.insert(patientAllergies).values(
        allergyIds.map((allergyId) => ({
          patientId: dto.cedula,
          allergyId,
        })),
      );
    }

    // Insertar enfermedades en la tabla intermedia
    if (diseaseIds?.length) {
      await this.db.insert(patientDiseases).values(
        diseaseIds.map((diseaseId) => ({
          patientId: dto.cedula,
          diseaseId,
        })),
      );
    }

    return this.buildPatientResponse(dto.cedula);
  }

  async update(cedula: string, dto: UpdatePatientDto) {
    const existing = await this.buildPatientResponse(cedula);

    if (!existing) {
      throw new NotFoundException(
        `No se encontró ningún paciente con la cédula "${cedula}".`,
      );
    }

    const { allergyIds, diseaseIds, ...patientData } = dto;

    // Si se actualiza empresa o cargo, validar la combinación
    if (patientData.companyId || patientData.positionId) {
      const companyId = patientData.companyId ?? existing.companyId ?? '';
      const positionId = patientData.positionId ?? existing.positionId ?? '';
      if (companyId && positionId) {
        await this.validateCompanyAndPosition(companyId, positionId);
      }
    }

    // Filtrar undefined para evitar "No values to set" de Drizzle
    const cleanPayload = Object.fromEntries(
      Object.entries(patientData).filter(([, v]) => v !== undefined),
    );
    if (Object.keys(cleanPayload).length > 0) {
      await this.db
        .update(patients)
        .set(cleanPayload)
        .where(eq(patients.cedula, cedula));
    }

    // Si se envían alergias, reemplazar las existentes
    if (allergyIds !== undefined) {
      if (allergyIds.length) await this.validateAllergies(allergyIds);

      await this.db
        .delete(patientAllergies)
        .where(eq(patientAllergies.patientId, cedula));

      if (allergyIds.length) {
        await this.db
          .insert(patientAllergies)
          .values(
            allergyIds.map((allergyId) => ({ patientId: cedula, allergyId })),
          );
      }
    }

    // Si se envían enfermedades, reemplazar las existentes
    if (diseaseIds !== undefined) {
      if (diseaseIds.length) await this.validateDiseases(diseaseIds);

      await this.db
        .delete(patientDiseases)
        .where(eq(patientDiseases.patientId, cedula));

      if (diseaseIds.length) {
        await this.db
          .insert(patientDiseases)
          .values(
            diseaseIds.map((diseaseId) => ({ patientId: cedula, diseaseId })),
          );
      }
    }

    return this.buildPatientResponse(cedula);
  }

  async remove(cedula: string): Promise<Patient> {
    const [existing] = await this.db
      .select()
      .from(patients)
      .where(eq(patients.cedula, cedula));

    if (!existing) {
      throw new NotFoundException(
        `No se encontró ningún paciente con la cédula "${cedula}".`,
      );
    }

    const [deleted] = await this.db
      .delete(patients)
      .where(eq(patients.cedula, cedula))
      .returning();

    return deleted;
  }
}
