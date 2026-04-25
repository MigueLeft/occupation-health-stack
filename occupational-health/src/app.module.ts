import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { AllergiesModule } from './allergies/allergies.module';
import { DiseasesModule } from './diseases/diseases.module';
import { DiseaseCategoriesModule } from './disease-categories/disease-categories.module';
import { BodySystemsModule } from './body-systems/body-systems.module';
import { CompaniesModule } from './companies/companies.module';
import { PositionsModule } from './positions/positions.module';
import { PatientsModule } from './patients/patients.module';
import { RequestsModule } from './requests/requests.module';
import { ConsultationsModule } from './consultations/consultations.module';
import { PhysicalExamsModule } from './physical-exams/physical-exams.module';
import { RestPeriodsModule } from './rest-periods/rest-periods.module';
import { ExamsModule } from './exams/exams.module';
import { ExamResultsModule } from './exam-results/exam-results.module';
import { RisksModule } from './risks/risks.module';
import { PsychometricTestCatalogModule } from './psychometric-test-catalog/psychometric-test-catalog.module';
import { PsychometricTestsModule } from './psychometric-tests/psychometric-tests.module';
import { ConsultationDiagnosticsModule } from './consultation-diagnostics/consultation-diagnostics.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    // Catálogos base (sin dependencias entre sí)
    AllergiesModule,
    DiseasesModule,
    DiseaseCategoriesModule,
    BodySystemsModule,
    ExamsModule,
    RisksModule,
    PsychometricTestCatalogModule,
    // Estructura de empresa
    CompaniesModule,
    PositionsModule,
    // Módulo principal de pacientes
    PatientsModule,
    // Flujo clínico
    RequestsModule,
    ConsultationsModule,
    PhysicalExamsModule,
    RestPeriodsModule,
    ExamResultsModule,
    PsychometricTestsModule,
    ConsultationDiagnosticsModule,
    RolesModule,
    UsersModule,
  ],
})
export class AppModule {}
