import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

import * as allergiesSchema from '../allergies/allergies.schema';
import * as diseasesSchema from '../diseases/diseases.schema';
import * as diseaseCategoriesSchema from '../disease-categories/disease-categories.schema';
import * as bodySystemsSchema from '../body-systems/body-systems.schema';
import * as companiesSchema from '../companies/companies.schema';
import * as positionsSchema from '../positions/positions.schema';
import * as patientsSchema from '../patients/patients.schema';
import * as requestsSchema from '../requests/requests.schema';
import * as consultationsSchema from '../consultations/consultations.schema';
import * as physicalExamsSchema from '../physical-exams/physical-exams.schema';
import * as restPeriodsSchema from '../rest-periods/rest-periods.schema';
import * as examsSchema from '../exams/exams.schema';
import * as examResultsSchema from '../exam-results/exam-results.schema';
import * as risksSchema from '../risks/risks.schema';
import * as psychometricTestCatalogSchema from '../psychometric-test-catalog/psychometric-test-catalog.schema';
import * as psychometricTestsSchema from '../psychometric-tests/psychometric-tests.schema';
import * as consultationDiagnosticsSchema from '../consultation-diagnostics/consultation-diagnostics.schema';
import * as authSchema from '../auth/auth.schema';
import * as rolesSchema from '../roles/roles.schema';
import * as disabilitiesSchema from '../disabilities/disabilities.schema';
import * as consultationDisabilitiesSchema from '../consultation-disabilities/consultation-disabilities.schema';

// Token de inyección para el cliente de Drizzle
export const DRIZZLE = Symbol('DRIZZLE');

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbUrl = config.getOrThrow<string>('DATABASE_URL');
        const pool = new Pool({
          connectionString: dbUrl,
          // [SERVERLESS] SSL y límite de conexiones para Vercel — remover al migrar a servidor dedicado
          // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
          // max: 1,
        });
        return drizzle(pool, {
          schema: {
            ...allergiesSchema,
            ...diseasesSchema,
            ...diseaseCategoriesSchema,
            ...bodySystemsSchema,
            ...companiesSchema,
            ...positionsSchema,
            ...patientsSchema,
            ...requestsSchema,
            ...consultationsSchema,
            ...physicalExamsSchema,
            ...restPeriodsSchema,
            ...examsSchema,
            ...examResultsSchema,
            ...risksSchema,
            ...psychometricTestCatalogSchema,
            ...psychometricTestsSchema,
            ...consultationDiagnosticsSchema,
            ...authSchema,
            ...rolesSchema,
            ...disabilitiesSchema,
            ...consultationDisabilitiesSchema,
          },
        });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
